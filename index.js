window.addEventListener("focus", function(event){ 
    chrome.runtime.sendMessage({message:"get-state"}, function(response){
        var list = document.getElementById('list');
        clearChildren(list);

        list.appendChild(activityList(response));

        var pTab = response[Object.keys(response)[0]];
        pTab.activities.shift()
        //var nTab = response[pTab.activities[1].tabId];

        out = recurseTab(pTab, response);
        out.className = "tree";
        list.appendChild(out);
    });
}, false);

function recurseTab(tab, tabs) {
    var ul = document.createElement("ul");
    ul.className = "activity";

    tab.activities.forEach(activity => {
        var li = document.createElement("li");
        li.className = "activity";
        switch (activity.type) {
            case 'tab':
                var text = document.createTextNode("➤ New Tab");
                li.appendChild(text);
                li.appendChild(recurseTab(tabs[activity.tabId], tabs));
                break;  
            case 'url':
                var text = document.createTextNode(activity.title);
                var link = document.createElement('a');
                link.href = activity.url;
                link.appendChild(text);
                li.appendChild(link);
                break;
        }

        var notes = document.createElement('ul');
        activity.notes.forEach(note => {
            var text = document.createTextNode(note.text);
            var li = document.createElement("li");
            li.appendChild(text);

            if (note.star) {
                li.className = "star";
            }

            notes.appendChild(li);
        });

        li.appendChild(notes);

        ul.appendChild(li);
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