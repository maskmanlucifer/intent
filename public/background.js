/* eslint-disable no-undef */
chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.local.set({ breakActive: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "endBreak") {
    chrome.storage.local.set({ breakActive: false });
  }
});
