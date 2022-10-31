const EXPLORE_PAGE_VISITED_COOKIE = 'visitedExplorePage=true';
const EXPLORE_PAGE_VISITED_COOKIE_WITH_EXPIRATION = 'visitedExplorePage=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';

export const setAlreadyVisitedCookie = () => {
  document.cookie = EXPLORE_PAGE_VISITED_COOKIE_WITH_EXPIRATION;
}

export const hasVisitedAllResults = () => !!document.cookie.split(';').find(string => string.trim() === EXPLORE_PAGE_VISITED_COOKIE);