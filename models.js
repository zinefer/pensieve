function Window(pensieve, id) {
    this.pensieve = pensieve;
    this.id = id;
    this.tabs = {};
}

function Tab(id) {
    this.id = id;
    this.activities = [];
    this.closed = false;
}

function Activity(type, options) {
    this.type = type;
    this.title = options.title;
    this.url = options.url;
    this.tabId = options.tabId;

    this.notes = [];
}

function Note(text, star) {
    this.text = text;
    this.star = (star == true);
}

Activity.prototype.addNote = function(text, star) {
    var note = new Note(text, star);
    
    var duplicate = false;
    this.notes.forEach(note => {
        if (text == note.text) {
            if (star != note.star) {
                note.star = star;
            }

            duplicate = true;
        }
    });

    if (duplicate) {
        return;
    }   
    
    this.notes.push(note);
    return note;
}

Tab.prototype.addActivity = function(type, options) {
    var activity = new Activity(type, options);
    
    if (this.currentActivity() == activity) {
        // Do not push a duplicate activity
        return this.currentActivity();
    }

    this.activities.push(activity);
    return activity;
}

Tab.prototype.currentActivity = function () {
    return this.activities[this.activities.length - 1];
}

Window.prototype.addTab = function(id) {
    var tab = new Tab(id);
    this.pensieve.indexTab(tab);
    return this.tabs[id] = tab;
}

Window.prototype.isTabTracked = function(id) {
    return typeof this.tabs[id] != 'undefined';
}

//************* */

function Pensieve() {
    this.windows = {};
    this.tabIndex = {};
}

Pensieve.prototype.addWindow = function(id) {
    return this.windows[id] = new Window(this, id);
}

Pensieve.prototype.isWindowTracked = function(id) {
    return typeof this.windows[id] != 'undefined';
}

Pensieve.prototype.isTabTracked = function(id) {
    return typeof this.tabIndex[id] != 'undefined';
}

Pensieve.prototype.indexTab = function(tab) {
    this.tabIndex[tab.id] = tab;
}

Pensieve.prototype.getTab = function(id) {
    return this.tabIndex[id];
}

/*
Pensieve.prototype.getWindowFromTab = function(id) {
    return this.getWindow(this.windex[id]);
}
*/

Pensieve.prototype.getWindow = function(id) {
    return this.windows[id];
}