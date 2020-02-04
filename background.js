/*
{
    title: "Window",
    footnotes: [ ],
    children: {
        123: {
            title: "http://google.com",
            footnotes: [
                {
                    title: "Snoopy the Doge",
                    star: false
                },
            ],
            children: {
                124: {
                    title: "http://jameskiefer.com",
                    footnotes: [ ],
                    children: { }
                }
            },
        }
    },
}
*/

var state = {
    windows: { },
    windex: { }
};

window.state = state;

function newWindow() {
    return {
        children: { },
        index: { }
    };
}

function newActivity(title) {
    return {
        title: title,
        footnotes: [],
        children: {}
    }
}

function newFootnote(note, star) {
    return {
        note: note,
        star: star === true
    }
}

function addNewWindow(window) {
    var pTab = window.tabs[0];
    state.windows[window.id] = newWindow();
    state.windows[window.id].children[pTab.id] = newActivity("Pensieve");
    state.windows[window.id].index[pTab.id] = state.windows[window.id];
}

function addNewActivity(tab) {
    var parent = state.windows[tab.windowId];

    if (typeof parent == 'undefined') return;
    
    if (tab.openerTabId) {
        parent = parent.index[tab.openerTabId];
    }

    // Register in page listeners
    chrome.tabs.executeScript(tab.id, {
        file: 'listeners.js'
    });

    parent.children[tab.id] = newActivity(tab.pendingUrl);
    state.windows[tab.windowId].index[tab.id] = parent.children[tab.id];
    state.windex[tab.id] = tab.windowId;
}

function addActivityFootnote(tab, footnote, starred) {
    state.windows[tab.windowId].index[tab.id].footnotes.push(
        newFootnote(footnote, starred)
    );
}

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
            addNewWindow(window);
        });
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    addNewActivity(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changes) {
    if (changes.url && state.windex[tabId]) {
        var tab = {
            id: tabId,
            openerTabId: tabId,
            windowId: state.windex[tabId],
            pendingUrl: changes.url
        }

        addNewActivity(tab);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case 'text-selected':
            addActivityFootnote(sender.tab, request.data)
            break;
        case 'text-copied':
            addActivityFootnote(sender.tab, request.data, true)
            break;
        case 'get-state':
            sendResponse(state.windows[sender.tab.windowId].children);
            break;
        default:
            break;
    }
});

chrome.windows.onRemoved.addListener(function(windowId) {
    //download("Pensieve", JSON.stringify(state.windows[windowId].children));
});

function download(file, text) { 
    var element = document.createElement('a'); 
    element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(text)); 
    element.setAttribute('download', file);
    document.body.appendChild(element);
    element.click(); 
    document.body.removeChild(element); 
}