import {createContext, useEffect, useState} from "react";

/**
 * Custom context provider to expose screen size application-wide
 * and prevent prop-drilling.
 * By exposing the context on our App.jsx, custom hooks can pull the
 * width value to compare with any given breakpoint at any given time
 * and only create one resize event listener for the whole app +
 * removing it on unmount.
 * @type {React.Context<{}>}
 */
const ViewportContext = createContext({});

export const ViewportContextProvider = ({children}) => {
  const [width, setWidth] = useState(window.innerWidth);

  const handleResize = () => {
    const frameElement = document.getElementById('main-frame');
    setWidth(frameElement.getBoundingClientRect().width);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewportContext.Provider value={{width}}>
      {children}
    </ViewportContext.Provider>
  )
}

export default ViewportContext;