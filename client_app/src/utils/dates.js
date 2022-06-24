const toDoubleDigit = num => num <= 9 ? `0${num}` : num;

/*
  Parse ISO date to human readable: dd/mm/YYYY hh:mm
*/
export const prettyPrintDate = dateString => {
  const date = new Date(dateString);
  const day = toDoubleDigit(date.getDate());
  const month = toDoubleDigit(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = toDoubleDigit(date.getHours());
  const minutes = toDoubleDigit(date.getMinutes());
  return `${day}/${month}/${year} ${hour}:${minutes}`;
}