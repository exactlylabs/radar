const ALL_RESULTS_VISITED_COOKIE = 'visitedAllResults=true';
const ALL_RESULTS_VISITED_COOKIE_WITH_EXPIRATION = 'visitedAllResults=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';

export const setAlreadyVisitedCookieIfNotPresent = () => {
  if(!hasVisitedAllResults()) document.cookie = ALL_RESULTS_VISITED_COOKIE_WITH_EXPIRATION;
}

export const hasVisitedAllResults = () => !!document.cookie.split(';').find(string => string.trim() === ALL_RESULTS_VISITED_COOKIE);