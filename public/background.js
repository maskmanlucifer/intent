/* eslint-disable no-undef */
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm && alarm.name === 'genericAlarm') {
    chrome.storage.local.set({ breakActive: true });
  }
  if (alarm && alarm.name.startsWith('event#')) {
    const eventId = alarm.name.split('#')[1];
    getDataFromIDB(eventId).then(event => {
      chrome.storage.local.set({ event: { id: eventId, title: event.title, start: event.start } });
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["alarms"], (data) => {
    const alarms = data.alarms || {};
    for (const [name, time] of Object.entries(alarms)) {
      if (Date.now() < Number(time)) {
        chrome.alarms.create(name, { when: Number(time) });
      } else {
        delete alarms[name];
      }
    }
  });
});

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('myStore')) {
        db.createObjectStore('myStore', { keyPath: 'id' });
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
