window.addEventListener("focus", function(event){ 
    chrome.runtime.sendMessage({message:"get-state"}, function(response){
        var list = document.getElementById('list');
        clearChildren(list);

        list.appendChild(activityList(response));

        var pTab = response[Object.keys(response)[0]];
        var nTab = response[pTab.activities[1].tabId];

        list.appendChild(recurseTab(nTab, response));
    });
}, false);

function recurseTab(tab, tabs) {
    var ul = document.createElement("ul");

    tab.activities.forEach(activity => {
        switch (activity.type) {
            case 'tab':
                ul.appendChild(recurseTab(tabs[activity.tabId], tabs));
                break;  
            case 'url':
                var text = document.createTextNode(activity.title);
                var li = document.createElement("li");
                li.appendChild(text);
                ul.appendChild(li);
                break;
        }
    });

    return ul;
}

function clearChildren(el) {
    var child = el.lastElementChild;  
    while (child) { 
        el.removeChild(child); 
        child = el.lastElementChild; 
    } 
}