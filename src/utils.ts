export const getTabId = () => {
  return crypto.randomUUID();
};

export const getDateAndTime = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hours, minutes);
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
  const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);
  return { formattedDate, formattedTime };
};
