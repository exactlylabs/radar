const ALL_RESULTS_VISITED_COOKIE = 'visitedAllResults=true';
const ALL_RESULTS_VISITED_COOKIE_WITH_EXPIRATION = 'visitedAllResults=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';

export const setAlreadyVisitedCookieIfNotPresent = () => {
  if(!hasVisitedAllResults()) document.cookie = ALL_RESULTS_VISITED_COOKIE_WITH_EXPIRATION;
}

export const hasVisitedAllResults = () => !!document.cookie.split(';').find(string => string.trim() === ALL_RESULTS_VISITED_COOKIE);

export const getCookie = (name) => {
  const cookie = document.cookie.split(';').find(string => string.trim().startsWith(name));
  return cookie ? cookie.split('=')[1] : null;
}

export const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}