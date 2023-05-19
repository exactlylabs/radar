import {useContext} from "react";
import ViewportContext from "../context/ViewportContent";
import {MID_SCREEN_BREAKPOINT, SMALL_SCREEN_BREAKPOINT} from "../utils/breakpoints";


/**
 * Custom hook for checking if current width is smaller than mid-screen size and bigger than small screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsMidScreen = () => {
  const {width} = useContext(ViewportContext);
  return width >= SMALL_SCREEN_BREAKPOINT && width < MID_SCREEN_BREAKPOINT;
}