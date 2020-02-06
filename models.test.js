import { Pensieve, Activity, Tab, Window, Note } from './models.js'


test('note model', () => {
    var note = new Note("sup", true);
    expect(note.text).toBe("sup");
    expect(note.star).toBe(true)
    var note = new Note("noway", false);
    expect(note.text).toBe("noway");
    expect(note.star).toBe(false)
});

test('activity model', () => {
    var activity = new Activity("url", {url: "jameskiefer.com"});
    expect(activity.type).toBe("url");
    expect(activity.url).toBe("jameskiefer.com");
    activity.addNote("Hi!", false);
    expect(activity.notes[0]).toMatchObject({text: "Hi!", star: false});
    activity.addNote("Hi!", false);
    expect(activity.notes.length).toBe(1);
    activity.addNote("Hi!", true);
    expect(activity.notes.length).toBe(1);
    expect(activity.notes[0]).toMatchObject({text: "Hi!", star: true});
    var activityb = new Activity("url", {url: "jameskiefer.com"});
    var activityc = new Activity("url", {url: "jameskiefert.com"});
    expect(activity.equals(activityb)).toBeTruthy();
    expect(activity.equals(activityc)).toBeFalsy();
});

test('tab model', () => {
    var tab = new Tab(444);
    expect(tab.id).toBe(444);
    tab.addActivity("url", { url: "bing.com" })
    expect(tab.currentActivity()).toMatchObject({type: "url", url: "bing.com"})
    tab.addActivity("url", { url: "bing.com" })
    expect(tab.activities.length).toBe(1);
});

test('window model', () => {
    var p = new Pensieve();
    var window = new Window(p, 888);
    expect(window.pensieve).toBe(p);
    expect(window.id).toBe(888);
    window.addTab(777);
    expect(window.tabs[777]).toMatchObject({id: 777});
    expect(p.tabIndex[777]).toMatchObject({id: 777});
});

test('pensieve model', () => {
    var p = new Pensieve();
    expect(p.isWindowTracked(1)).toBeFalsy();
    expect(p.isTabTracked(1)).toBeFalsy();
    p.addWindow(111);
    expect(p.isWindowTracked(111)).toBeTruthy();
    expect(p.getWindow(111)).toMatchObject({ id: 111, pensieve: p });
    p.getWindow(111).addTab(555);
    expect(p.isTabTracked(555)).toBeTruthy();
    expect(p.getTab(555)).toMatchObject({ id: 555 });
    var tab = new Tab(222);
    p.indexTab(tab);
    expect(p.tabIndex[222]).toMatchObject({ id: 222 });
});