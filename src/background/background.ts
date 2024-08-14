import { Website } from "../utils/types";
import { isChromeInternalUrl } from "../utils/utils";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if(message.task === "checkWebsiteStatus"){

        (async() => {
            try {
                const result = await chrome.storage.local.get("blocked_websites");
                const blocked_websites: Website[] = result.blocked_websites || [];
                const blocked = blocked_websites.some((website) => (website.url === message.url));
                sendResponse({ blocked: blocked });
            } catch (error) {
                sendResponse({ error: true, errorObject: error });
            }
        })();

        return true;

    }

    if (message.task === "blockWebsite") {

        (async () => {
            try {
                await chrome.scripting.executeScript({target: {tabId:message.tabId},files: ["insert.js"]})
                await chrome.scripting.insertCSS({target: {tabId: message.tabId}, files: ["insert.css"]})
                sendResponse({ success: true })

            } catch (error) {
                sendResponse({ success:false, error: error })
            }

        })();

        return true;

    }


    if (message.task === "unblockWebsite") {
        (async () => {
            try {
                await chrome.tabs.reload(message.tabId);
                sendResponse({ success: true })
            } catch (error) {
                sendResponse({ success: false, error: error })
            }
        })();

        return true;
    }

    if(message.task === "checkAllWebsitesStatus"){

        (async() => {
            try {

                const result = await chrome.storage.local.get("blocked_websites");
                const blockedWebsites:Website[] = result.blocked_websites || [];
                console.log(blockedWebsites, "from background allstatus");
                

                const senderTabUrl = sender.tab!.url!;
                const senderTabId = sender.tab!.id!;

                if(isChromeInternalUrl(senderTabUrl)){
                    sendResponse({success: false, message: "internal chrome url!"})
                    return true;
                }

                const isCurrentTabBlocked = blockedWebsites.some((website) => website.url === senderTabUrl)

                if(isCurrentTabBlocked){

                    await chrome.scripting.executeScript({target: {tabId:senderTabId},files: ["insert.js"]})
                    await chrome.scripting.insertCSS({target: {tabId: senderTabId}, files: ["insert.css"]})
                    sendResponse({success: true})

                }else{
                    sendResponse({success: false, message:"URL not Blocked"})
                }


                
            } catch (error) {
                sendResponse({ success: false, error: error })
            }
        })();

        return true;
    }
    
})
