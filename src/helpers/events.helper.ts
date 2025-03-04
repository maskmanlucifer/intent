import { TCalendarEvent, TSessionData } from "../types";
import { getItem } from "../db/localStorage";
import { TSettings } from "../types";
import { RRule } from "rrule";
import { setIsImporting, updateEvents } from "../redux/eventsSlice";
import { updateEventsData, cleanEventsData, getEventsData } from "../db";
import { store } from "../redux/store";
import { createId } from "../helper";

import moment from 'moment-timezone';
import { setSessionData } from "../redux/sessionSlice";

const getISTTime = (time: string) => {
  // Preserve the original time without shifting
  const indiaTimeString = moment
    .parseZone(time)
    .tz('Asia/Kolkata', true)
    .format('YYYY-MM-DDTHH:mm:ssZ');

  return indiaTimeString;
}

export const getDataFromAPI = async (url: string) => {
  const response = await fetch(
    "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/getIcalEvents",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    }
  );

  return response.json();
};

const cancelAlarms = (ids: string[]) => {
  ids.forEach((id) => {
    chrome.alarms.clear(id, () => {});
  });
};

const getRecurringEvents = (event: any, targetDate: Date) => {
  const { uid, summary, description, start, end, rrule } = event as any;

  const eventStart = new Date(getISTTime(start));
  const eventEnd = new Date(getISTTime(end));

  if (rrule) {
    try {
      // Clone the options to avoid modifying the original
      const ruleOptions = { ...rrule.options };

      // Convert string dates to proper Date objects
      if (typeof ruleOptions.dtstart === "string") {
        ruleOptions.dtstart = new Date(getISTTime(ruleOptions.dtstart));
      }

      if (typeof ruleOptions.until === "string") {
        ruleOptions.until = new Date(getISTTime(ruleOptions.until));
      }

      // Create the rule with corrected options
      const rule = new RRule(ruleOptions);

      // Create new Date objects for day boundaries
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Get occurrences for the target date
      const occurrences = rule.between(dayStart, dayEnd, true);

      // Special handling for nth weekday rules (bynweekday)
      if (ruleOptions.bynweekday && ruleOptions.bynweekday.length > 0) {
        // Extract nth weekday information
        const nthWeekdayRules = ruleOptions.bynweekday.map((rule: any) => {
          const weekday = rule[0]; // 0=Monday, 1=Tuesday, etc.
          const nth = rule[1]; // nth occurrence (1=first, 2=second, etc.)
          return { weekday, nth };
        });

        // Check if target date matches any of the nth weekday rules
        const targetWeekday = targetDate.getDay(); // 0=Sunday, 1=Monday, etc. in JS
        // Convert from JS weekday to RRule weekday (JS: 0=Sunday, RRule: 0=Monday)
        const targetRRuleWeekday = targetWeekday === 0 ? 6 : targetWeekday - 1;

        // Get which occurrence of this weekday it is in the month
        const firstDayOfMonth = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          1
        );
        const daysToAdd = (7 + targetWeekday - firstDayOfMonth.getDay()) % 7;
        const firstOccurrenceOfWeekday = daysToAdd + 1;
        const targetNth = Math.ceil(
          (targetDate.getDate() - firstOccurrenceOfWeekday + 1) / 7
        );

        // Check if any rule matches our target date's weekday and nth occurrence
        const matchesNthWeekdayRule = nthWeekdayRules.some(
          (rule: any) =>
            rule.weekday === targetRRuleWeekday && rule.nth === targetNth
        );

        // If no rule matches, return empty array
        if (!matchesNthWeekdayRule) {
          return [];
        }
      }

      // If we get here, either the date matches an nth weekday rule or it's a regular rule
      return occurrences.map((occurrence) => {
        const start = occurrence.getTime();
        const timezoneOffset = -330; // Kolkata is UTC+5:30, which is +330 minutes
        const startUTC = start + timezoneOffset * 60000; // Convert to UTC epoch time
        return {
        id: createId(),
        uid,
        title: summary,
        description,
        start: startUTC,
        end: startUTC + (eventEnd.getTime() - eventStart.getTime())
      }});
    } catch (e) {
      console.error("RRule error:", e);
      return [];
    }
  }

  return [];
};

const fetchEvents = async (icalUrl: string): Promise<TCalendarEvent[]> => {
  try {
    const data = await getDataFromAPI(icalUrl);

    const targetDate = new Date();

    const filteredEvents: TCalendarEvent[] = Object.values(data as any).flatMap(
      (event: any) => {
        if (
          typeof event === "object" &&
          event !== null &&
          (event as any).type === "VEVENT"
        ) {
          const { uid, summary, description, start, end } = event as any;

          const eventStart = new Date(getISTTime(start));
          const eventEnd = new Date(getISTTime(end));

          // Check normal scheduled events
          if (
            eventStart instanceof Date &&
            !isNaN(eventStart.getTime()) &&
            eventEnd instanceof Date &&
            !isNaN(eventEnd.getTime()) &&
            eventStart.toDateString() === targetDate.toDateString()
          ) {
            return [
              {
                id: createId(),
                uid,
                title: summary,
                description,
                start: Date.now() + 5 * 60 * 1000, // Set to the next five minutes
                end: Date.now() + 10 * 60 * 1000,
              },
            ];
          }

          return getRecurringEvents(event, targetDate);
        }
        return [];
      }
    );

    return filteredEvents;
  } catch (error) {
    return [];
  }
};

export const handleImportCalendar = async (forceImport: boolean = false) => {
  const sessionData = getItem("sessionData") as TSessionData;
  const settingsData = getItem("settings") as TSettings;

  const { lastCalendarFetchTime } = sessionData || {};
  const { icalUrl } = settingsData || {};

  const shouldImport = icalUrl && (forceImport || !lastCalendarFetchTime || (new Date(lastCalendarFetchTime).getDate() < new Date().getDate()));

  try {
    if (shouldImport) {
      store.dispatch(setIsImporting(true));
      const filteredEvents = await fetchEvents(icalUrl);

      const existingEvents = (await getEventsData()) as TCalendarEvent[];
      const eventIdsToCancel = existingEvents.map((event) => event.id);

      cancelAlarms(eventIdsToCancel);

      updateEventsData(filteredEvents).then(() => {
        store.dispatch(updateEvents(filteredEvents));
        store.dispatch(setIsImporting(false));
        filteredEvents.forEach((event) => {
          const timeUntilEvent = event.start - Date.now();

          if (timeUntilEvent > 20 * 60 * 1000) {
            const delayInMinutes = (timeUntilEvent / 60000) - 10;
            chrome.alarms.create("calendar-event#" + event.id, {
              delayInMinutes: delayInMinutes > 0 ? delayInMinutes : 0,
            });
          }
        });
        store.dispatch(setSessionData({
          ...sessionData,
          lastCalendarFetchTime: Date.now(),
        }));
      });
    }

    const existingEvents = (await getEventsData()) as TCalendarEvent[];
    store.dispatch(updateEvents(existingEvents));
  } catch (error) {
    console.error("Error fetching or parsing ICS:", error);
    store.dispatch(updateEvents([]));
  }
};

export const handleRemoveCalendar = async () => {
  const existingEvents = (await getEventsData()) as TCalendarEvent[];
  const eventIdsToCancel = existingEvents.map((event) => event.id);

  cancelAlarms(eventIdsToCancel);

  cleanEventsData().then(() => {
    store.dispatch(updateEvents([]));
  });
};
