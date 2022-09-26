/**
 * Capitalize any string to have the first letter as uppercase and
 * the rest lowercase.
 * @param str: string to transform
 * @return strOut: capitalized string
 */
export const capitalize = (str: string): string => {
  return `${str.substring(0, 1).toUpperCase()}${str.substring(1, str.length).toLowerCase()}`;
}