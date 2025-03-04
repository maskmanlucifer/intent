import { getItem } from "../db/localStorage";

export const handleBreakSchedule = (force: boolean = false) => {
  if (chrome.alarms) {
    chrome.alarms.get("genericAlarm", (alarm) => {
      if (!alarm || force) {
        const sessionData = getItem("sessionData") || {};

        const { workingHours = ["09:00", "17:00"], interval = 90 } = sessionData;

        const [startHour, endHour] = workingHours;
        const startTime = new Date();
        const endTime = new Date();

        const [startHours, startMinutes] = startHour.split(':').map(Number);
        const [endHours, endMinutes] = endHour.split(':').map(Number);

        startTime.setHours(startHours, startMinutes, 0, 0);
        endTime.setHours(endHours, endMinutes, 0, 0);

        let startEpoch = startTime.getTime();
        const endEpoch = endTime.getTime();

        const now = new Date();
        const currentEpoch = now.getTime();

        let breakTs;

        while(startEpoch < endEpoch) {
          const testEpoch = startEpoch + interval * 60 * 1000;
          if(testEpoch > endEpoch) {
            break;
          } else if(testEpoch > currentEpoch) {
            breakTs = testEpoch;
            break;
          } else {
            startEpoch = testEpoch;
          }
        }

        chrome.alarms.clear("genericAlarm");

        if(breakTs) {
          chrome.alarms.create("genericAlarm", {
            when: breakTs,
          });
        }
      }
    });
  }
};
