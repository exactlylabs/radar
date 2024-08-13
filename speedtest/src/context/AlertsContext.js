import {createContext, useState} from "react";

export const SNACKBAR_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

/**
 * Custom context provider to show error snackbars application-wide
 * By exposing the context on our App.jsx, custom hooks can be called
 * to show generic alert messages across all screens.
 * @type {React.Context<{}>}
 */
const AlertsContext = createContext({});

export const AlertsContextProvider = ({children}) => {
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState(SNACKBAR_TYPES.INFO);

  const closeSnackbar = () => {
    setIsSnackbarVisible(false);
  }

  const showSnackbarMessage = (message, type = SNACKBAR_TYPES.INFO) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setIsSnackbarVisible(true);
  }

  return (
    <AlertsContext.Provider value={{snackbarType, snackbarMessage, isSnackbarVisible, showSnackbarMessage, closeSnackbar}}>
      {children}
    </AlertsContext.Provider>
  )
}

export default AlertsContext;