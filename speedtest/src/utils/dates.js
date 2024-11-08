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
  date.setHours(0, 0, 0, 0);
  return date;
}

export const getToday = () => setMidnight(new Date());

export const sixMonthsFromToday = () => {
  const today = getToday();
  return setMidnight(new Date(today.setMonth(today.getMonth() - 6)));
}

export const firstDayOfCurrentYear = () => {
  const today = getToday();
  return setMidnight(new Date(today.getFullYear(), 0, 1));
}

export const firstDayOfLastYear = () => {
  const today = getToday();
  return setMidnight(new Date(today.getFullYear() - 1, 0, 1));
}

export const lastDayOfLastYear = () => {
  const today = getToday();
  return setMidnight(new Date(today.getFullYear(), 0, 0));
}

// string in format mm/dd/YYYY - mm/dd/YYYY with 2-digit padding
export const getRangeLabel = (from, to) => {
  const fromString = `${from.getMonth() + 1}/${from.getDate()}/${from.getFullYear()}`;
  const toString = `${to.getMonth() + 1}/${to.getDate()}/${to.getFullYear()}`;
  return `${fromString} - ${toString}`;
}