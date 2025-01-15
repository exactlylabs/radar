const localeStringOptions = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
  second: undefined,
};

//  Parse ISO dates to human-readable: mm/dd/YYYY, hh:mm {AM|PM}
export const prettyPrintDate = dateString => new Date(dateString).toLocaleString('en-us', localeStringOptions);

export const setMidnight = date => {
  date.setHours(23, 59, 59, 999);
  return date;
}

export const setStartOfDay = date => {
  date.setHours(0, 0, 0, 0);
  return date;
}

export const getToday = (side = 'end') => {
  if(side === 'start') return setStartOfDay(new Date());
  return setMidnight(new Date());
}

export const sixMonthsFromToday = (side = 'end') => {
  const today = getToday();
  if(side === 'start') return setStartOfDay(new Date(today.setMonth(today.getMonth() - 6)));
  return setMidnight(new Date(today.setMonth(today.getMonth() - 6)));
}

export const firstDayOfCurrentYear = (side = 'end') => {
  const today = getToday();
  if(side === 'start') return setStartOfDay(new Date(today.getFullYear(), 0, 1));
  return setMidnight(new Date(today.getFullYear(), 0, 1));
}

export const firstDayOfLastYear = (side = 'end') => {
  const today = getToday();
  if(side === 'start') return setStartOfDay(new Date(today.getFullYear() - 1, 0, 1));
  return setMidnight(new Date(today.getFullYear() - 1, 0, 1));
}

export const lastDayOfLastYear = (side = 'end') => {
  const today = getToday();
  if(side === 'start') return setStartOfDay(new Date(today.getFullYear() - 1, 11, 31));
  return setMidnight(new Date(today.getFullYear(), 0, 0));
}

export const getInitialTime = (side = 'start') => {
  const firstDate = new Date(2022, 0, 1);
  if(side === 'start') return setStartOfDay(firstDate);
  return setMidnight(firstDate);
}

// string in format mm/dd/YYYY - mm/dd/YYYY with 2-digit padding
export const getRangeLabel = (from, to) => {
  const fromString = `${from.getMonth() + 1}/${from.getDate()}/${from.getFullYear()}`;
  const toString = `${to.getMonth() + 1}/${to.getDate()}/${to.getFullYear()}`;
  return `${fromString} - ${toString}`;
}