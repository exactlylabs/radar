import {useEffect, useState} from "react";
import { isTouchDevice } from "../utils/screen";

export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
};