import { TCalendarEvent } from "../types";
import { RRule } from "rrule";
import { setIsImporting, updateEvents } from "../redux/eventsSlice";
import { updateEventsData, cleanEventsData, getEventsData } from "../db";
import { store } from "../redux/store";
import { createId } from "../helper";
import moment from "moment-timezone";
import { syncSettings } from "../redux/sessionSlice";

// Convert time string to the specified timezone
const getTimeInTimezone = (time: string, timezone: string) => {
  // Convert the time to the specified timezone
  return moment
    .parseZone(time)
    .tz(timezone)
    .format("YYYY-MM-DDTHH:mm:ssZ");
};

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
    chrome.alarms.clear(`calendar-event#${id}`, () => {});
  });
};

// Process recurring events with proper timezone handling
const getRecurringEvents = (event: any, targetDate: Date, timezone: string) => {
  const { uid, summary, description, start, end, rrule } = event as any;

  // Convert times using the timezone from settings
  const eventStart = new Date(getTimeInTimezone(start, timezone));
  const eventEnd = new Date(getTimeInTimezone(end, timezone));
  const eventDuration = eventEnd.getTime() - eventStart.getTime();

  if (rrule) {
    try {
      // Clone the options to avoid modifying the original
      const ruleOptions = { ...rrule.options };

      // Convert string dates to proper Date objects with timezone
      if (typeof ruleOptions.dtstart === "string") {
        ruleOptions.dtstart = new Date(
          getTimeInTimezone(ruleOptions.dtstart, timezone)
        );
      }

      if (typeof ruleOptions.until === "string") {
        ruleOptions.until = new Date(
          getTimeInTimezone(ruleOptions.until, timezone)
        );
      }

      // Create the rule with corrected options
      const rule = new RRule(ruleOptions);

      // Create new Date objects for day boundaries in the target timezone
      const targetDateInTimezone = moment.tz(targetDate, timezone).toDate();
      const dayStart = new Date(targetDateInTimezone);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(targetDateInTimezone);
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
        const targetMoment = moment.tz(targetDate, timezone);
        // Convert from JS weekday to RRule weekday (JS: 0=Sunday, RRule: 0=Monday)
        const targetRRuleWeekday = targetMoment.day() === 0 ? 6 : targetMoment.day() - 1;

        // Calculate which occurrence of this weekday it is in the month
        const firstDayOfMonth = targetMoment.clone().startOf('month');
        const daysToAdd = (7 + targetMoment.day() - firstDayOfMonth.day()) % 7;
        const firstOccurrenceOfWeekday = daysToAdd + 1;
        const targetNth = Math.ceil(
          (targetMoment.date() - firstOccurrenceOfWeekday + 1) / 7
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

      // Map occurrences to calendar events with proper timezone handling
      return occurrences.map((occurrence) => {
        // Create a moment object in the target timezone
        const occurrenceMoment = moment.tz(occurrence, timezone);
        
        // Get the time components from the original event start
        const originalStartMoment = moment.tz(eventStart, timezone);
        
        // Set the time components on the occurrence date
        occurrenceMoment.hour(originalStartMoment.hour());
        occurrenceMoment.minute(originalStartMoment.minute());
        occurrenceMoment.second(originalStartMoment.second());
        
        // Get the timestamp
        const startTime = occurrenceMoment.valueOf();
        
        return {
          id: createId(),
          uid,
          title: summary,
          description,
          start: startTime,
          end: startTime + eventDuration,
        };
      });
    } catch (e) {
      console.error("RRule error:", e);
      return [];
    }
  }

  return [];
};

const fetchEvents = async (
  icalUrl: string,
  timezone: string
): Promise<TCalendarEvent[]> => {
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

          // Convert times using the timezone from settings
          const eventStart = new Date(getTimeInTimezone(start, timezone));
          const eventEnd = new Date(getTimeInTimezone(end, timezone));

          // Check if this is a normal (non-recurring) event for today
          if (
            eventStart instanceof Date &&
            !isNaN(eventStart.getTime()) &&
            eventEnd instanceof Date &&
            !isNaN(eventEnd.getTime())
          ) {
            // Compare dates in the specified timezone
            const eventDateStr = moment.tz(eventStart, timezone).format('YYYY-MM-DD');
            const targetDateStr = moment.tz(targetDate, timezone).format('YYYY-MM-DD');
            
            if (eventDateStr === targetDateStr) {
              return [
                {
                  id: createId(),
                  uid,
                  title: summary,
                  description,
                  start: eventStart.getTime(),
                  end: eventEnd.getTime(),
                },
              ];
            }
          }

          return getRecurringEvents(event, targetDate, timezone);
        }
        return [];
      }
    );

    return filteredEvents;
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    return [];
  }
};

export const handleImportCalendar = async (forceImport: boolean = false) => {
  if (!chrome || !chrome.storage) {
    return;
  }

  const userSettings = (await chrome.storage.local.get("intentSettings")) || {};

  const { lastCalendarFetchTime, icalUrl, timezone } =
    userSettings.intentSettings || {};
  const userTimezone = timezone || moment.tz.guess();

  const shouldImport =
    icalUrl &&
    (forceImport ||
      !lastCalendarFetchTime ||
      new Date(lastCalendarFetchTime).getDate() < new Date().getDate());

  try {
    if (shouldImport) {
      store.dispatch(setIsImporting(true));
      const filteredEvents = await fetchEvents(icalUrl, userTimezone);

      const existingEvents = (await getEventsData()) as TCalendarEvent[];
      const eventIdsToCancel = existingEvents.map((event) => event.id);

      cancelAlarms(eventIdsToCancel);

      updateEventsData(filteredEvents).then(() => {
        store.dispatch(updateEvents(filteredEvents));
        store.dispatch(setIsImporting(false));
        
        // Set alarms for upcoming events
        filteredEvents.forEach((event) => {
          const timeUntilEvent = event.start - Date.now();
          const delayInMinutes = Math.max(Math.ceil(timeUntilEvent / 60000), 0);

          if (delayInMinutes > 5) {
            chrome.alarms.create(`calendar-event#${event.id}`, {
              delayInMinutes: delayInMinutes - 5,
            });
          }
        });

        syncSettings({
          lastCalendarFetchTime: Date.now(),
        });
      });
    } else {
      // If not importing, make sure we have alarms for existing events
      const existingEvents = (await getEventsData()) as TCalendarEvent[];
      
      existingEvents.forEach((event) => {
        chrome.alarms.get(`calendar-event#${event.id}`, (alarm) => {
          if (!alarm) {
            const timeUntilEvent = event.start - Date.now();
            const delayInMinutes = Math.max(Math.ceil(timeUntilEvent / 60000), 0);

            if (delayInMinutes > 5) {
              chrome.alarms.create(`calendar-event#${event.id}`, {
                delayInMinutes: delayInMinutes - 5,
              });
            }
          }
        });
      });
      
      store.dispatch(updateEvents(existingEvents));
    }
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