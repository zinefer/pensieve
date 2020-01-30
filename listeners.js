function selectedText(){
    return document.getSelection().toString();
}

document.onmouseup = function() {
    var selected = selectedText();
    if (selected !== '') {
        chrome.runtime.sendMessage({'message':'text-selected','data': selected}, function(response){});
    }
}

document.oncopy = function () {
    var selected = selectedText();
    if (selected !== '') {
        chrome.runtime.sendMessage({'message':'text-copied','data': selected}, function(response){});
    }
}