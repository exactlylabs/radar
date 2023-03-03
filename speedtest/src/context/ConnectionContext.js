import {createContext, useEffect, useState} from "react";

const ConnectionContext = createContext({});

export const ConnectionContextProvider = ({children}) => {
  const [noInternet, setNoInternet] = useState(false);

  const handleSetOnline = () => setNoInternet(false);
  const handleSetOffline = () => setNoInternet(true);

  useEffect(() => {
    setNoInternet(!navigator.onLine);
    window.addEventListener('online', handleSetOnline);
    window.addEventListener('offline', handleSetOffline);

    return () => {
      window.removeEventListener('online', handleSetOnline);
      window.removeEventListener('offline', handleSetOffline);
    }
  }, []);

  return (
    <ConnectionContext.Provider value={{noInternet, setNoInternet}}>
      {children}
    </ConnectionContext.Provider>
  );
}

export default ConnectionContext;