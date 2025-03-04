import { getItem } from "../db/localStorage";

export const handleBreakSchedule = (force?: boolean) => {
  if (chrome.alarms) {
    chrome.alarms.get("genericAlarm", (alarm) => {
      if (!alarm || force) {
        const settings = getItem("settings") || {};

        const { workingHours = ["09:00", "17:00"], breakInterval = 90 } = settings;

        const now = new Date();
        const [startTimeStr, endTimeStr] = workingHours;

        const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
        const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes, 0, 0);
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, 0, 0);

        const startEpoch = startTime.getTime();
        const endEpoch = endTime.getTime();
        const currentEpoch = now.getTime();

        let breakTs: number | undefined;

        if (currentEpoch >= startEpoch && currentEpoch <= endEpoch) {
          let testEpoch = startEpoch;

          while (testEpoch < endEpoch) {
            testEpoch += breakInterval * 60 * 1000;
            
            if (testEpoch > endEpoch) {
              break;
            }
            
            if (testEpoch > currentEpoch) {
              breakTs = testEpoch;
              break;
            }
          }
        }

        chrome.alarms.clear("genericAlarm");

        if (breakTs) {
          chrome.alarms.create("genericAlarm", {
            when: breakTs,
          });
        }
      }
    });
  }
};