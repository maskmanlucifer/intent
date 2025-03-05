/* eslint-disable no-undef */
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm && alarm.name === 'genericAlarm') {
    chrome.storage.local.set({ breakActive: true });
  }
  if (alarm && alarm.name.startsWith('calendar-event#')) {
    const eventId = alarm.name.split('#')[1];
    getDataFromIDB(eventId).then(event => {
      chrome.storage.local.set({ event: { id: eventId, title: event.title, start: event.start } });
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  // Add some logics here
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