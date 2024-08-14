import { Website } from "../utils/types";

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
    
})
