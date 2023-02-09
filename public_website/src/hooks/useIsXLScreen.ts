import {useContext} from "react";
import ViewportContext from "../context/ViewportContent";
import {LARGE_SCREEN_BREAKPOINT} from "../utils/breakpoints";


/**
 * Custom hook for checking if current width is larger than large screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsXLScreen = () => {
  const {width} = useContext(ViewportContext);
  return width >= LARGE_SCREEN_BREAKPOINT;
}