export const isKeyInSession = key => sessionStorage.getItem(key) !== null;

export const getSessionValue = key => sessionStorage.getItem(key);

export const setSessionValue = (key, value) => sessionStorage.setItem(key, value);