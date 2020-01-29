const chrome = require('sinon-chrome');
global.chrome = chrome;

require('./background.js');

const fakeWindow = {
    id: 667,
    tabs: [
        {id: 123}
    ]
}

const fakeTab = {
    windowId: 667
}

test('registers a context-menu', () => {
    chrome.runtime.onInstalled.dispatch();
    expect(chrome.contextMenus.create.calledOnce).toBeTruthy();
});

test('creating a pensieve window', () => {
    chrome.windows.create.yields(fakeWindow);
    chrome.contextMenus.onClicked.dispatch({});
    expect(chrome.windows.create.called).toBeFalsy();
    chrome.contextMenus.onClicked.dispatch({menuItemId: 'new-window'});
    expect(chrome.windows.create.calledOnce).toBeTruthy();
});

test('creating a new tab in an untracked window creates no activity', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    tab.windowId = 3;
    chrome.tabs.onCreated.dispatch(tab);
    expect(window.state.windows[667].children[124]).toBeUndefined();
    expect(window.state.windows[667].index[124]).toBeUndefined();
});

test('creating a new tab without an openerTabId creates some activity', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    chrome.tabs.onCreated.dispatch(tab);
    expect(window.state.windows[667].children[124]).toBeTruthy();
    expect(window.state.windows[667].index[124]).toBeTruthy();
});

test('creating a new tab with an openerTabId creates some activity', () => {
    var tab = Object.create(fakeTab);
    tab.id = 125;
    tab.openerTabId = 124;
    chrome.tabs.onCreated.dispatch(tab);
    expect(window.state.windows[667].children[124].children[125]).toBeTruthy();
    expect(window.state.windows[667].index[125]).toBeTruthy();
});

test('an existing tab changes url creates some activity', () => {
    var tabId = 125;
    var changes = {url: "http://jameskiefer.com"};
    
    chrome.tabs.onUpdated.dispatch(tabId, changes);
});

test('an untracked tab changes url creates no activity', () => {
    var tabId = 999;
    var changes = {url: "http://jameskiefer.com"};
    
    chrome.tabs.onUpdated.dispatch(tabId, changes);
});

test('a file is downloaded when the window is closed', () => {
    var appended = false, removed = false, clicked = false;

    document.body.appendChild = function(el) {
        el.click = function(){
            clicked = true;
        };
        appended = true;
    };

    document.body.removeChild = function(el) {
        removed = true;
    };

    chrome.windows.onRemoved.dispatch(fakeTab.windowId);
    expect(appended).toBeTruthy();
    expect(removed).toBeTruthy();
    expect(clicked).toBeTruthy();
});