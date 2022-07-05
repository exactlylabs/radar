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
