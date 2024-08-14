import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client"
import "./popup.css"
import { Website, websiteStatus } from "../utils/types";

const Popup = () => {

    

    const [ currentStatus, setCurrentStatus ] = useState<websiteStatus>("unblocked")
    const [currentHostName, setCurrentHostName] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        
        // setting current blocked/unblocked status
        const activeTabHostName = new URL(activeTab.url!).hostname;
        setCurrentHostName(activeTabHostName);

        // setting current status
        chrome.runtime.sendMessage({task: "checkWebsiteStatus", url: activeTab.url!}, (response) => {
            const isBlocked = response.blocked;
            setCurrentStatus(isBlocked? "blocked" : "unblocked");
        })

      })

      if(error){
        const timer = setTimeout(() => {
            setError(null);
        }, 3000)

        return () => clearTimeout(timer);
      }

    }, [currentStatus, currentHostName, error]);


    const handleBlockWebsite = async () => {
        try {
            const result = await chrome.storage.local.get("blocked_websites")
            const blockedWebsitesArray:Website[] = result.blocked_websites || [];
            

            const activeTabObject = await chrome.tabs.query({active:true, currentWindow:true});
            const activeTabUrl = activeTabObject[0].url;

            const isCurrentWebsiteBlocked = blockedWebsitesArray.some((website) => {
                return website.url === activeTabUrl;
                
            })
            
            if(isCurrentWebsiteBlocked){
                throw new Error("Website Already Blocked!")
            }

            const newBlockArray:Website[] = [...blockedWebsitesArray, {url: activeTabUrl!, status: "blocked"}]
            await chrome.storage.local.set({"blocked_websites" : newBlockArray})

            chrome.runtime.sendMessage({task: "checkWebsiteStatus", url: activeTabUrl }, (response) => {
                const blocked = response.blocked;
                setCurrentStatus(blocked === true ? "blocked" : "unblocked");
            })
            


        } catch (error) {
            console.log(error, "from submit button");
            setError((error as Error).message)
            
        }
    }

    const handleUnBlockWebsite = async () => {
        try {
            const result = await chrome.storage.local.get("blocked_websites")
            const blockedWebsitesArray:Website[] = result.blocked_websites || [];
            

            const activeTabObject = await chrome.tabs.query({active:true, currentWindow:true});
            const activeTabUrl = activeTabObject[0].url;

            const isCurrentWebsiteUnBlocked = blockedWebsitesArray.some((website) => {
                return website.url !== activeTabUrl;
                
            })
            
            if(isCurrentWebsiteUnBlocked){
                throw new Error("Website Already UnBlocked!")
            }

            const filteredBlockArray = blockedWebsitesArray.filter((website) => (website.url !== activeTabUrl))
            await chrome.storage.local.set({"blocked_websites" : filteredBlockArray})

            chrome.runtime.sendMessage({task: "checkWebsiteStatus", url: activeTabUrl }, (response) => {
                const blocked = response.blocked;
                setCurrentStatus(blocked === true ? "blocked" : "unblocked");
            })
            
        } catch (error) {
            console.log(error, "from submit button");
            setError((error as Error).message)
            
        }
    }

    return (
        <div className="popup-container">
            <div className="popup-info-div">
                <h3>Status</h3>
                <h1 style={{backgroundColor: currentStatus === "blocked" ? "red" : "rgb(0, 235, 0)"}}>{currentStatus}</h1>
                <h3>{currentHostName}</h3>
            </div>
            <div className="divider"></div>
            <div className="popup-buttons-div">
                <button onClick={handleBlockWebsite} disabled={currentStatus === "blocked"}>Block</button>
                <button onClick={handleUnBlockWebsite} disabled={currentStatus === "unblocked"}>UnBlock</button>
            </div>
            
            {error && <div className="error-div"><h2>{error}</h2></div>}
        </div>
    )
}

const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<Popup />)
