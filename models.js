class Window {
    constructor(pensieve, id) {
        this.pensieve = pensieve;
        this.id = id;
        this.tabs = {};
    }
    addTab(id) {
        var tab = new Tab(id);
        this.pensieve.indexTab(tab);
        return this.tabs[id] = tab;
    }
    isTabTracked(id) {
        return typeof this.tabs[id] != 'undefined';
    }
};

class Tab {
    constructor(id) {
        this.id = id;
        this.activities = [];
        this.closed = false;
    }
    addActivity(type, options) {
        var activity = new Activity(type, options);
        
        if (this.currentActivity() == activity) {
            // Do not push a duplicate activity
            return this.currentActivity();
        }
    
        this.activities.push(activity);
        return activity;
    }
    currentActivity() {
        return this.activities[this.activities.length - 1];
    }
}

class Activity {
    constructor(type, options) {
        this.type = type;
        this.title = options.title;
        this.url = options.url;
        this.tabId = options.tabId;

        this.notes = [];
    }
    addNote(text, star) {
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
}

class Note {
    constructor(text, star) {
        this.text = text;
        this.star = (star == true);
    }
}

class Pensieve {
    constructor() {
        this.windows = {};
        this.tabIndex = {};
    }
    addWindow(id) {
        return this.windows[id] = new Window(this, id);
    }
    isWindowTracked(id) {
        return typeof this.windows[id] != 'undefined';
    }
    isTabTracked(id) {
        return typeof this.tabIndex[id] != 'undefined';
    }
    indexTab(tab) {
        this.tabIndex[tab.id] = tab;
    }
    getTab(id) {
        return this.tabIndex[id];
    }
    getWindow(id) {
        return this.windows[id];
    }
}

export default Pensieve