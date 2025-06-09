export const handleReminderSchedule = async () => {
    if (!chrome || !chrome.storage) {
        return;
      }
    
      const userSettings = (await chrome.storage.local.get("intentSettings")) || {};
    
      const { lastReminderScheduleTime } = userSettings.intentSettings || {};
        
      const last = lastReminderScheduleTime
        ? new Date(lastReminderScheduleTime)
        : new Date(0);

      const now = new Date();

      const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

      const shouldSchedule = hoursDiff > 24 || last.getDate() !== now.getDate();

      if (shouldSchedule) {
        chrome.runtime.sendMessage({ action: "SCHEDULE_REMINDERS" });
      }
};
