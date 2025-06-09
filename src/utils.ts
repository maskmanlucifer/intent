
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { store } from './redux/store';

// Extend dayjs with timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimezone = () => {
  const timeZone = store.getState().session.timezone;
  return timeZone || dayjs.tz.guess();
};

export const getTabId = () => {
  return crypto.randomUUID();
};

export const getDateAndTime = (date: string, time: string) => {
  // Parse the UTC date and time
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create a dayjs object in UTC
  const utcDateTime = dayjs.utc(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  
  // Convert to user's timezone
  const userTimezone = getTimezone();
  const localDateTime = utcDateTime.tz(userTimezone);
  
  // Format the date and time
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    timeZone: userTimezone
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true,
    timeZone: userTimezone
  };
  
  const formattedDate = localDateTime.toDate().toLocaleDateString('en-US', dateOptions);
  const formattedTime = localDateTime.toDate().toLocaleTimeString('en-US', timeOptions);
  
  return { formattedDate, formattedTime };
};