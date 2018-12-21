/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-lunch-schedule", {
  // Default module config.
  defaults: {
    scheduleUrl: "localhost:3000",
    reloadInterval: 5 * 60 * 1000, // every 5 minutes
    SCHEDULE_URL: "http://localhost:3000/current_week_schedules",
    WEEK_DAYS: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"],
    ERROR_MESSAGE: "Hmm.. server kaputt :(",
    EMPTY_MESSAGE: "Je'l to Željo na odmoru? :O",
    HEADING: "Ručak",
  },
  getStyles: function () {
    return ["MMM-lunch-schedule.css"];
  },
  start: function () {
    var self = this;

    self.getData();
    setInterval(function () {
      self.getData();
    }, self.config.reloadInterval);

    window.onresize = function () {
      self.updateDom();
    };
  },
  getDom: function () {
    const self = this;
    let wrapper = document.createElement("div");
    let hr = document.createElement("hr");
    let listRoot = document.createElement("ul");
    listRoot.setAttribute("id", "schedule-list");
    wrapper.innerHTML = self.config.HEADING;
    wrapper.appendChild(hr);
    wrapper.appendChild(listRoot);
    return wrapper;
  },
  socketNotificationReceived: function (notification, payload) {
    var self = this;

    if (notification === "LUNCH_SCHEDULE") {
      self.displaySchedule(payload);
    } else if (notification === "ERROR_LUNCH_SCHEDULE") {
      self.displayError(payload);
    }
  },
  getData: function () {
    const self = this;
    const config = Object.assign({}, self.config);
    self.sendSocketNotification("FETCH_LUNCH_SCHEDULE", config);
  },
  getWeekDay: function (timestamp) {
    const self = this;
    let dow = moment(timestamp).day();
    return self.config.WEEK_DAYS[dow];
  },

  createScheduleElement: function (schedule) {
    var self = this;
    let listItem = document.createElement("li");
    let weekDay = self.getWeekDay(schedule["date"] * 1000) + " "; // seconds to milliseconds
    this.appendElement(listItem, weekDay, "schedule-day");
    this.appendElement(listItem, schedule["lunch"], "schedule-lunch");
    return listItem;
  },

  appendElement: function (parent, text, className) {
    let span = document.createElement("span");
    let textNode = document.createTextNode(text);
    span.setAttribute("class", className);
    span.appendChild(textNode);
    parent.appendChild(span);
  },

  displaySchedule: function (schedule) {
    const self = this;
    schedule.length ? self.displayList(schedule) : self.displayMessage(self.config.EMPTY_MESSAGE);
  },

  displayList: function (schedules) {
    const self = this;
    self.lunchSchedule = schedules;
    self.clearList();
    schedules
      .map(schedule => this.createScheduleElement(schedule))
      .forEach(item => this.scheduleList().appendChild(item));
  },

  displayError: function (error) {
    const self = this;
    console.log(error);
    self.displayMessage(this.config.ERROR_MESSAGE);
  },

  displayMessage: function (message) {
    const self = this;
    self.clearList();
    let textElement = document.createTextNode(message);
    self.scheduleList().appendChild(textElement);
  },

  clearList: function () {
    const self = this;
    self.scheduleList().innerHTML = ""
  },

  scheduleList: function () {
    return document.getElementById("schedule-list")
  },

});
