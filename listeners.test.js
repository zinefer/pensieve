const chrome = require('sinon-chrome');
global.chrome = chrome;

var test_string = "";

document.getSelection = function() {
    return test_string;
}

require('./listeners.js');

test('sendMessage is not called when there is no selection', () => {
    document.onmouseup();
    document.oncopy();
    expect(chrome.runtime.sendMessage.called).toBeFalsy();
});

test('text-selected is sent onmouseup', () => {
    test_string = "I am a little TEST";
    document.onmouseup();
    expect(chrome.runtime.sendMessage.withArgs({message: 'text-selected', data: test_string})).toBeTruthy();
});

test('text-copied is sent oncopy', () => {
    document.oncopy();
    expect(chrome.runtime.sendMessage.withArgs({message: 'text-copied', data: test_string})).toBeTruthy();
});