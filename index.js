window.addEventListener("focus", function(event){ 
    chrome.runtime.sendMessage({message:"get-state"}, function(response){
        var list = document.getElementById('list');
        clearChildren(list);

        list.appendChild(activityList(response));
    });
}, false);

function activityList(activities) {
    var ul = document.createElement("ul");
    
    for (i in activities) {
        var activity = activities[i];
        var text = document.createTextNode(activity.title);
        var li = document.createElement("li");
        li.appendChild(text);
        ul.appendChild(li);
        if (Object.keys(activity.children).length) {
            ul.appendChild(activityList(activity.children))
        }
    }    

    return ul;    
}

function clearChildren(el) {
    var child = el.lastElementChild;  
    while (child) { 
        el.removeChild(child); 
        child = el.lastElementChild; 
    } 
}