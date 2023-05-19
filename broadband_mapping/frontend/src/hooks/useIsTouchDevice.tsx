import {useRef} from "react";
import { isTouchDevice } from "../utils/screen";


export const useIsTouchDevice = () => {
  return useRef(isTouchDevice());
}