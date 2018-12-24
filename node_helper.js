"use strict";

const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
  start: function () {
		const self = this;
		console.log("Starting node helper for: " + self.name);
		self.cache = {};
  },

  socketNotificationReceived: function (notification, payload) {
		const self = this;
		if (notification === "FETCH_LUNCH_SCHEDULE") {
			self.fetchWeeklySchedule(payload);
		}
  },
  fetchWeeklySchedule: function (payload) {
		const self = this;
		return self.fetch("GET", payload.SCHEDULE_URL);
  },
  fetch: function (method, url, body) {
		const self = this;
		request({
			url: url,
			method: method,
			headers: {"cache-control": "no-cache"},
			body: body,
			},
			function (error, response, body) {
			if (error) {
				self.sendSocketNotification("ERROR_LUNCH_SCHEDULE", {error: error});
				return console.error("MMM-lunch-schedule: " + error);
			}
			self.sendSocketNotification("LUNCH_SCHEDULE", JSON.parse(body));
			});
  },


});
