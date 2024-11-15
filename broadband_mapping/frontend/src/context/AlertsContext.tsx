import {createContext, ReactElement, useState} from "react";

export const SNACKBAR_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

type AlertsContextValue = {
  snackbarType: string;
  snackbarMessage: string;
  isSnackbarVisible: boolean;
  showSnackbarMessage: (message: string, type?: string) => void;
  closeSnackbar: () => void;
}

const defaultValue: AlertsContextValue = {
  snackbarType: SNACKBAR_TYPES.INFO,
  snackbarMessage: '',
  isSnackbarVisible: false,
  showSnackbarMessage: (message: string, type?: string) => {},
  closeSnackbar: () => {}
}

const AlertsContext = createContext(defaultValue);

interface AlertsContextProps {
  children: ReactElement
}

export const AlertsContextProvider = ({children}: AlertsContextProps) => {
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState(SNACKBAR_TYPES.INFO);
  
  const closeSnackbar = () => {
    setIsSnackbarVisible(false);
  }
  
  const showSnackbarMessage = (message: string, type = SNACKBAR_TYPES.INFO) => {
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