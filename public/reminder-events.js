/* eslint-disable no-undef */

/**
 * Checks if a reminder is due today based on the user's timezone
 * @param {Object} reminder - The reminder object
 * @param {Date} now - Current date/time (optional, defaults to new Date())
 * @returns {boolean} - True if reminder is due today
 */
function isReminderDueToday(reminder, now = new Date()) {
  if (!reminder || !reminder.date || !reminder.time) {
    return false;
  }

  const { date, time, isRecurring, repeatRule, repeatOn = [], timeZone } = reminder;
  
  // Use user's timezone or system default
  const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // STEP 1: Get today's date in user's timezone
  const todayInUserTZ = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  // STEP 2: Convert stored UTC date/time back to user's timezone for comparison
  const storedUTCDateTime = new Date(`${date}T${time}:00.000Z`);
  const reminderDateInUserTZ = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(storedUTCDateTime);

  // STEP 3: Top-level check - if reminder start date is in future, don't trigger
  const todayDate = new Date(todayInUserTZ + 'T00:00:00.000');
  const reminderStartDate = new Date(reminderDateInUserTZ + 'T00:00:00.000');
  
  if (reminderStartDate > todayDate) {
    return false;
  }

  // STEP 4: Handle non-recurring reminders
  if (!isRecurring) {
    return reminderDateInUserTZ === todayInUserTZ;
  }

  // STEP 5: Handle recurring reminders
  return checkRecurringReminder(
    storedUTCDateTime,
    repeatRule,
    repeatOn,
    tz
  );
}

/**
 * Helper function to check recurring reminder logic
 */
function checkRecurringReminder(storedUTCDateTime, repeatRule, repeatOn, timeZone) {
  
  // Get current date/time in user's timezone for day calculations
  const nowInUserTZ = new Date().toLocaleString('en-US', { timeZone });
  const currentDateInUserTZ = new Date(nowInUserTZ);
  
  switch (repeatRule) {
    case "daily":
      // For daily reminders, check if current day of week is in enabled days
      const currentDayOfWeek = currentDateInUserTZ.getDay();
      return Array.isArray(repeatOn) && repeatOn.length > 0 
        ? repeatOn.includes(currentDayOfWeek)
        : true; // If no specific days, assume every day

    case "weekly":
      // For weekly, check if today's day of week matches the original reminder's day
      const todayDayOfWeek = currentDateInUserTZ.getDay();
      
      // Get the original day of week when reminder was created (in user's timezone)
      const originalReminderInUserTZone = new Date(storedUTCDateTime.toLocaleString('en-US', { timeZone }));
      const originalDayOfWeek = originalReminderInUserTZone.getDay();
      
      return todayDayOfWeek === originalDayOfWeek;

    case "monthly":
      // For monthly, check if today's day of month matches the original reminder's day
      const todayDayOfMonth = currentDateInUserTZ.getDate();
      
      // Get the original day of month when reminder was created (in user's timezone)
      const originalReminderInUserTZ = new Date(storedUTCDateTime.toLocaleString('en-US', { timeZone }));
      const originalDayOfMonth = originalReminderInUserTZ.getDate();
      
      // Handle end-of-month edge cases (e.g., Jan 31 -> Feb 28/29)
      const currentYear = currentDateInUserTZ.getFullYear();
      const currentMonth = currentDateInUserTZ.getMonth();
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      if (originalDayOfMonth > daysInCurrentMonth) {
        // If original day doesn't exist in current month, use last day of month
        return todayDayOfMonth === daysInCurrentMonth;
      }
      
      return todayDayOfMonth === originalDayOfMonth;

    default:
      return false;
  }
}

function getMinutesUntilReminder(reminder, now = new Date()) {
  const { time: reminderTime } = reminder;
  if (!reminderTime) return null;

  // Convert current time to UTC time string (HH:mm format)
  const currentTimeUTC = now.toISOString().substring(11, 16); // Extract HH:mm

  // Parse both times as minutes from midnight
  const reminderMinutes = parseTimeToMinutes(reminderTime);
  const currentMinutes = parseTimeToMinutes(currentTimeUTC);

  if (reminderMinutes === null || currentMinutes === null) return null;

  // Calculate the difference
  let diffMinutes = reminderMinutes - currentMinutes;

  // Handle day boundary crossings
  if (diffMinutes < -720) { // More than 12 hours behind, likely next day
    diffMinutes += 1440; // Add 24 hours worth of minutes
  } else if (diffMinutes > 720) { // More than 12 hours ahead, likely previous day
    diffMinutes -= 1440; // Subtract 24 hours worth of minutes
  }

  return diffMinutes;
}

// Helper function to convert time string (HH:mm) to minutes from midnight
function parseTimeToMinutes(timeString) {
  if (!timeString || typeof timeString !== 'string') return null;
  
  const parts = timeString.split(':');
  if (parts.length !== 2) return null;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  return hours * 60 + minutes;
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
