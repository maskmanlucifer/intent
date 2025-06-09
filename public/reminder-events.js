/* eslint-disable no-undef */

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Check if reminder is due today (from previous logic)
function isReminderDueToday(reminder, now = new Date()) {
  if (!reminder) return false;

  const { date, isRecurring, repeatRule, repeatOn = [] } = reminder;

  const todayStr = now.toISOString().split("T")[0];
  const todayDate = new Date(todayStr);
  const startDate = new Date(date);

  // If reminder starts in future, don't trigger
  if (startDate > todayDate) return false;

  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();

  if (!isRecurring) {
    return date === todayStr;
  }

  switch (repeatRule) {
    case "daily":
      return repeatOn.includes(dayOfWeek);

    case "weekly": {
      const scheduledDay = startDate.getDay();
      return dayOfWeek === scheduledDay;
    }

    case "monthly": {
      const scheduledDayOfMonth = startDate.getDate();
      const daysInMonth = getDaysInMonth(now);
      return (
        scheduledDayOfMonth === dayOfMonth && scheduledDayOfMonth <= daysInMonth
      );
    }

    default:
      return false;
  }
}

function getMinutesUntilReminder(reminder, now = new Date()) {
  if (!reminder) return null;

  const reminderTimeStr = reminder.time || "00:00";

  const todayStr = now.toISOString().split("T")[0];
  const triggerDate = new Date(`${todayStr}T${reminderTimeStr}:00`);

  const diffMs = triggerDate - now;

  return Math.floor(Math.max(diffMs, 0) / 60000);
}

function checkReminderStatus(reminder, now = new Date()) {
  if (!reminder) return { eligible: false, minutes: null };

  const eligible = isReminderDueToday(reminder, now);
  if (!eligible) return { eligible: false, minutes: null };

  const minutes = getMinutesUntilReminder(reminder, now);

  return { eligible, minutes };
}

export const scheduleReminder = (reminder) => {
  const { eligible, minutes } = checkReminderStatus(reminder);

  if (eligible) {
    chrome.alarms.clear(`reminder:${reminder.id}`);
    chrome.alarms.create(`reminder:${reminder.id}`, {
      delayInMinutes: minutes,
    });
  }
};

const checkDailyEvents = async () => {
  const events = await getRemindersFromIDB();
  events.forEach(scheduleReminder);
  const settings = await chrome.storage.local.get("intentSettings") || {};

  if(settings.intentSettings) {
  chrome.storage.local.set({
    intentSettings: {
      ...settings.intentSettings,
      lastReminderScheduleTime: Date.now(),
        lastUpdatedAt: Date.now(),
      },
    });
  }
};

// Add reminder to active reminders list
const addToActiveReminders = async (reminder) => {
  const settings = await chrome.storage.local.get("intentSettings");
  const activeReminders = settings.intentSettings?.activeReminders || [];

  const updatedActiveReminders = activeReminders.filter((r) => r.id !== reminder.id);
  updatedActiveReminders.push(reminder);

  const orderedActiveReminders = updatedActiveReminders.sort((a, b) => {
    const aDateTime = new Date(`${a.date}T${a.time}`);
    const bDateTime = new Date(`${b.date}T${b.time}`);
    return aDateTime - bDateTime;
  });

  await chrome.storage.local.set({
    intentSettings: {
      ...settings.intentSettings,
      activeReminders: orderedActiveReminders,
      lastUpdatedAt: Date.now(),
    },
  });
};

// Remove reminder from active reminders list
const removeFromActiveReminders = async (reminderId) => {
  const settings = await chrome.storage.local.get("intentSettings");
  const activeReminders = settings.intentSettings?.activeReminders || [];

  await chrome.storage.local.set({
    intentSettings: {
      ...settings.intentSettings,
      activeReminders: activeReminders.filter((r) => r.id !== reminderId),
    },
  });
};

export const putReminderToIDB = async (reminder) => {
  const db = await openDB();
  const transaction = db.transaction("reminders", "readwrite");
  const store = transaction.objectStore("reminders");
  return new Promise((resolve, reject) => {
    const request = store.put(reminder);
    request.onsuccess = (event) => {
      resolve(event.target.result);
      chrome.runtime.sendMessage({ type: "REMINDER_DATA_UPDATED" });
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const removeReminderFromIDB = async (reminderId) => {
  const db = await openDB();
  const transaction = db.transaction("reminders", "readwrite");
  const store = transaction.objectStore("reminders");
  return new Promise((resolve, reject) => {
    const request = store.delete(reminderId);
    request.onsuccess = (event) => {
      resolve(event.target.result);
      chrome.runtime.sendMessage({ type: "REMINDER_DATA_UPDATED" });
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const getRemindersFromIDB = async () => {
  const db = await openDB();
  const transaction = db.transaction("reminders", "readonly");
  const store = transaction.objectStore("reminders");
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const getReminderDataFromIDB = async (reminderId) => {
  const db = await openDB();
  const transaction = db.transaction("reminders", "readonly");
  const store = transaction.objectStore("reminders");
  return new Promise((resolve, reject) => {
    const request = store.get(reminderId);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("intent", 4);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("calendarEvents")) {
        db.createObjectStore("calendarEvents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("linkboard")) {
        db.createObjectStore("linkboard", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("reminders")) {
        db.createObjectStore("reminders", { keyPath: "id" });
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

export {
  checkDailyEvents,
  addToActiveReminders,
  removeFromActiveReminders,
  getReminderDataFromIDB,
};
