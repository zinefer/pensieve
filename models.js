function Window() {
    this.tabs = {};
}

function Tab() {
    this.actvities = [];
    this.closed = false;
}

function Activity(type, options) {
    this.type = type;
    this.title = options.title;
    this.url = options.url;
    this.tab_id = options.tab_id;

    this.notes = [];
}

function Note(text, star) {
    this.text = text;
    this.star = (star == true);
}

Activity.prototype.addNote(text, star) {
   this.notes.push(new Note(text, star));
}

Tab.prototype.addActivity(type, options) {
    this.actvities.push(new Activity(type, options));
}

Window.prototype.addTab = function(id) {
    this.tabs[id] = new Tab();
}

//************* */

function Pensieve() {
    this.state = { 
        windows: {}
    };
}

Pensieve.prototype.addWindow = function(id) {
    this.state.windows[id] = new Window();
}