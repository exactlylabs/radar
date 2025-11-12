import {createContext, ReactElement, useEffect, useState} from "react";

/**
 * Custom context provider to expose screen size application-wide
 * and prevent prop-drilling.
 * By exposing the context on our Index.jsx, custom hooks can pull the
 * width value to compare with any given breakpoint at any given time
 * and only create one resize event listener for the whole app +
 * removing it on unmount.
 * @type {React.Context<{}>}
 */
const ViewportContext = createContext({width: 0, isClient: false});

interface ViewportContextProviderProps {
  children: ReactElement
}

export const ViewportContextProvider = ({children}: ViewportContextProviderProps) => {
  const [width, setWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // eslint-disable-next-line
  useEffect(() => {
    // Set isClient to true after component mounts (client-side only)
    setIsClient(true);

    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      
      const handleResize = () => {
        setWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <ViewportContext.Provider value={{width, isClient}}>
      {children}
    </ViewportContext.Provider>
  );
}

export default ViewportContext;