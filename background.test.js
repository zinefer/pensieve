import chrome from 'sinon-chrome';
global.chrome = chrome;

var p = require('./background.js').default;

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

test('creating a new tab in an untracked window does not track the tab', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    tab.windowId = 3;
    chrome.tabs.onCreated.dispatch(tab);
    expect(p.isTabTracked(124)).toBeFalsy();
    expect(p.isWindowTracked(333)).toBeFalsy();
});

test('creating a new tab gets tracked', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    chrome.tabs.onCreated.dispatch(tab);
    expect(p.isTabTracked(124)).toBeTruthy();
});

test('creating a new tab from the old tab creates some activity', () => {
    var tab = Object.create(fakeTab);
    tab.id = 125;
    tab.openerTabId = 124;
    chrome.tabs.onCreated.dispatch(tab);
    expect(p.isTabTracked(125)).toBeTruthy();
    expect(p.getTab(124).currentActivity()).toMatchObject({notes: [], tabId: 125, type: 'tab'});
});

test('an ignored url records no activity', () => {
    var tabId = 124;
    var changes = {url: "chrome://newtab"};
    chrome.tabs.get.yields({id: 124, title: "Whoo boy"});
    chrome.tabs.onUpdated.dispatch(tabId, changes);
    expect(p.getTab(124).currentActivity()).toMatchObject({type: 'tab'});
});

test('an existing tab changes url creates some activity', () => {
    var tabId = 125;
    var changes = {url: "http://jameskiefer.com"};
    chrome.tabs.get.yields({id: 125, title: "Whoo boy"});
    chrome.tabs.onUpdated.dispatch(tabId, changes);
    expect(p.getTab(125).currentActivity()).toMatchObject({notes: [], url: changes.url, type: 'url'});
});

test('an existing tab changes title is recorded in activity', () => {
    var tabId = 125;
    var changes = {title: "James Kiefer"};
    chrome.tabs.get.yields({id: 125, title: "Whoo boy"});
    chrome.tabs.onUpdated.dispatch(tabId, changes);
    expect(p.getTab(125).currentActivity()).toMatchObject({title: "James Kiefer"});
});

test('an untracked tab changes url creates no activity', () => {
    var tabId = 999;
    var changes = {url: "http://jameskiefer.com"};
    chrome.tabs.get.yields({id: 999, title: "???!!"});
    chrome.tabs.onUpdated.dispatch(tabId, changes);
    expect(p.isTabTracked(999)).toBeFalsy();
});

test('selecting some text saves a footnote', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    var message = {'message':'text-selected','data': "HelloMoto"};
    chrome.runtime.onMessage.dispatch(message, {tab: tab});
    var note = p.getTab(124).currentActivity().notes[0];    
    expect(note.text).toBe(message.data);
    expect(note.star).toBeFalsy();
});

test('copying some text saves a starred footnote', () => {
    var tab = Object.create(fakeTab);
    tab.id = 124;
    var message = {'message':'text-copied','data': "Severus Snape"};
    chrome.runtime.onMessage.dispatch(message, {tab: tab});
    var note = p.getTab(124).currentActivity().notes[1];    
    expect(note.text).toBe("Severus Snape");
    expect(note.star).toBeTruthy();
});

test('sending some random message does nothing because code coverage', () => {
    var tab = Object.create(fakeTab);
    tab.id = 777;
    var message = {'message':'do-nothing-please','data': "Severus Snape"};
    chrome.runtime.onMessage.dispatch(message, {tab: tab});
    expect(p.isTabTracked(777)).toBeFalsy();
});

test('get-state request, gets the state', () => {
    var tab = Object.create(fakeTab);
    var message = {'message':'get-state'};
    chrome.runtime.onMessage.dispatch(message, {tab: tab}, function(obj) {
        expect(obj).toMatchObject({
            123: { id: 123, activities: [], closed: false},
            124: { id: 124, activities: [
                { notes: [ { text: "HelloMoto", star: false }, { text: "Severus Snape", star: true } ], tabId: 125, type: "tab" }
            ], closed: false},
            125: { id: 125, activities: [
                { notes: [], title: "James Kiefer", url: "http://jameskiefer.com", type: "url" }
            ], closed: false}
        });
    });
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

    appended = false;
    removed = false;
    clicked = false;

    // Close a non-tracked window
    chrome.windows.onRemoved.dispatch(333);
    expect(appended).toBeFalsy();
    expect(removed).toBeFalsy();
    expect(clicked).toBeFalsy();
});

