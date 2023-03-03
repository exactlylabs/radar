import {useContext} from "react";
import ViewportContext from "../context/ViewportContent";
import {LARGE_SCREEN_BREAKPOINT, MID_SCREEN_BREAKPOINT} from "../utils/breakpoints";


/**
 * Custom hook for checking if current width is smaller than large screen size and bigger than mid screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsLargeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width >= MID_SCREEN_BREAKPOINT && width < LARGE_SCREEN_BREAKPOINT;
}