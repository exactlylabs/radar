import {useContext} from "react";
import MenuContext from '../context/MenuContent';

export const useContentMenu = () => {
  return useContext(MenuContext);
}