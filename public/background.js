/* eslint-disable no-undef */
chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.local.set({ breakActive: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "endBreak") {
    chrome.storage.local.set({ breakActive: false });
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ naman: 1 });

  chrome.storage.local.get(["alarms"], (data) => {
    const alarms = data.alarms || {};
    for (const [name, time] of Object.entries(alarms)) {
      if (Date.now() < time) {
        chrome.alarms.create(name, { when: time });
      } else {
        delete alarms[name];
      }
    }
  });
});
