/**
 * Custom context provider to expose generic menu management
 * application-wide and prevent prop-drilling.
 * By exposing the context on our App.jsx, custom hooks can pull the
 * handlers to set any given React Element at any given time.
 * @type {React.Context<{}>}
 */
import {createContext, ReactElement, useState} from "react";
import {Optional} from "../utils/types";
import {MenuContent} from "../components/common/MyGenericMenu/menu";

type MenuContextValue = {
  menuContent: Optional<MenuContent>;
  setMenuContent: (content: Optional<MenuContent>) => void;
}

// On app initialization, it gets set
const defaultValue: MenuContextValue = {
  menuContent: null,
  setMenuContent: (content: Optional<MenuContent>) => {}
}

const MenuContext = createContext(defaultValue);

interface MenuContentProps {
  children: ReactElement
}

export const MenuContextProvider = ({children}: MenuContentProps) => {
  const [menuContent, setMenuContent] = useState<Optional<MenuContent>>(null);
  return (
    <MenuContext.Provider value={{menuContent, setMenuContent}}>
      {children}
    </MenuContext.Provider>
  )
}

export default MenuContext;