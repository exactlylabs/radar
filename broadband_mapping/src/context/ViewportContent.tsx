import {createContext, ReactElement, useEffect, useState} from "react";
import {Optional} from "../utils/types";

/**
 * Custom context provider to expose screen size application-wide
 * and prevent prop-drilling.
 * By exposing the context on our App.jsx, custom hooks can pull the
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
  const [width, setWidth] = useState(window.innerWidth);

  const handleResize = () => {
    const frameElement: Optional<HTMLElement> = document.getElementById('main-frame');
    if(frameElement) setWidth(frameElement.getBoundingClientRect().width);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewportContext.Provider value={{width}}>
      {children}
    </ViewportContext.Provider>
  );
}

export default ViewportContext;