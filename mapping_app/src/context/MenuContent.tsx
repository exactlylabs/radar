/**
 * Custom context provider to expose generic menu management
 * application-wide and prevent prop-drilling.
 * By exposing the context on our App.jsx, custom hooks can pull the
 * handlers to set any given React Element at any given time.
 * @type {React.Context<{}>}
 */
import {createContext, ReactElement, useState} from "react";
import {Optional} from "../utils/types";

type MenuContextValue = {
  menuContent: Optional<ReactElement>;
  setMenuContent: (content: Optional<ReactElement>) => void;
}

// On app initialization, it gets set
const defaultValue: MenuContextValue = {
  menuContent: null,
  setMenuContent: (content: Optional<ReactElement>) => {}
}

const MenuContext = createContext(defaultValue);

interface MenuContentProps {
  children: ReactElement
}

export const MenuContextProvider = ({children}: MenuContentProps) => {
  const [menuContent, setMenuContent] = useState<Optional<ReactElement>>(null);
  return (
    <MenuContext.Provider value={{menuContent, setMenuContent}}>
      {children}
    </MenuContext.Provider>
  )
}

export default MenuContext;