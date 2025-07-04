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
const ViewportContext = createContext({width: 0});

interface ViewportContextProviderProps {
  children: ReactElement
}

export const ViewportContextProvider = ({children}: ViewportContextProviderProps) => {
  const [width, setWidth] = useState(0);

  // eslint-disable-next-line
  useEffect(() => {
    if(!!window) {
      setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  });

  const handleResize = () => {
    if(!!window) setWidth(window.innerWidth);
  }

  return (
    <ViewportContext.Provider value={{width}}>
      {children}
    </ViewportContext.Provider>
  );
}

export default ViewportContext;