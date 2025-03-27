/* eslint-disable no-undef */
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({});
  const hasOffscreen = existingContexts.some((c) => c.contextType === "OFFSCREEN_DOCUMENT");

  if (!hasOffscreen) {
      await chrome.offscreen.createDocument({
          url: "offscreen.html",
          reasons: ["AUDIO_PLAYBACK"],
          justification: "Play background music",
      });
  }
}

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm && alarm.name === 'genericAlarm') {
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
          chrome.storage.local.set({
            intentSettings: { ...data.intentSettings, activePage: "Break", lastUpdatedAt: Date.now() },
          });
      }
  });
  }
  if (alarm && alarm.name.startsWith('calendar-event#')) {
    const eventId = alarm.name.split('#')[1];
    getDataFromIDB(eventId).then(event => {
      if(event.start > Date.now()) {
        chrome.storage.local.set({ event: { id: eventId, title: event.title, start: event.start } });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "PLAY_MUSIC") {
      await ensureOffscreenDocument();
      chrome.runtime.sendMessage({ action: "play", url: request.url });
      chrome.storage.local.get("intentSettings", (data) => {
        if (data.intentSettings) {
            chrome.storage.local.set({
              intentSettings: { ...data.intentSettings, isMusicPlaying: true, lastUpdatedAt: Date.now() },
            });
        }
    });
  }

  if (request.action === "PAUSE_MUSIC") {
    chrome.runtime.sendMessage({ action: "pause" });
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
          chrome.storage.local.set({
            intentSettings: { ...data.intentSettings, isMusicPlaying: false, lastUpdatedAt: Date.now() },
          });
      }
  });
  }

  sendResponse({ success: true });
});

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('intent', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('calendarEvents')) {
        db.createObjectStore('calendarEvents', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const getDataFromIDB = async (eventId) => {
  const db = await openDB();
  const transaction = db.transaction('calendarEvents', 'readonly');
  const store = transaction.objectStore('calendarEvents');
  return new Promise((resolve, reject) => {
    const request = store.get(eventId);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};