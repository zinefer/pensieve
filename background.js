const ignoredUrls = [
    "chrome://newtab",
    "chrome://newtab/"
]

import Pensieve from './models.js'

var p = new Pensieve();

// New Window Button
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "new-window",
        title: "Spawn new window",
        contexts: ["page_action"]
    });
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "new-window") {
        chrome.windows.create({url: chrome.runtime.getURL("index.html")}, function(window){
            p.addWindow(window.id).addTab(window.tabs[0].id);
        });
    }
});

// tab.onCreated
chrome.tabs.onCreated.addListener(function(tab) {
    if (tab.openerTabId && p.isTabTracked(tab.openerTabId)) {
        p.getTab(tab.openerTabId)
         .addActivity(
            'tab',
            {
                tabId: tab.id,
            }
        );
    }

    if (p.isWindowTracked(tab.windowId)) {
        p.getWindow(tab.windowId).addTab(tab.id);
    }
});

// tab.onUpdated
chrome.tabs.onUpdated.addListener(function(tabId, changes) {
    if (p.isTabTracked(tabId)) {
        if (changes.title && p.getTab(tabId).currentActivity()) {
            p.getTab(tabId).currentActivity().title = changes.title;
        }

        if (changes.url) {
            if (ignoredUrls.indexOf(changes.url) >= 0) return;

            // Register in-page listeners
            chrome.tabs.executeScript(tabId, {
                file: 'listeners.js'
            });

            chrome.tabs.get(tabId, function(tab){
                var options = Object.assign(tab, changes);
                
                p.getTab(tabId).addActivity('url', {
                    title: options.title,
                    url: options.url,
                });
            });
        }
    }
});

// runtime.onMessage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var window = p.getWindow(sender.tab.windowId);
    console.log(request);
    switch (request.message) {
        case 'text-selected':
            p.getTab(sender.tab.id).currentActivity().addNote(request.data);
            break;
        case 'text-copied':
            p.getTab(sender.tab.id).currentActivity().addNote(request.data, true);
            break;
        case 'get-state':
            sendResponse(window.tabs);
            break;
        default:
            break;
    }
});

chrome.windows.onRemoved.addListener(function(windowId) {
    if (p.isWindowTracked(windowId)) {
        //download("Pensieve", JSON.stringify(p.getWindow(windowId)));
    }
});

function download(file, text) { 
    var element = document.createElement('a'); 
    element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(text)); 
    element.setAttribute('download', file);
    document.body.appendChild(element);
    element.click(); 
    document.body.removeChild(element); 
}