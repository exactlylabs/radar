import {useContext} from "react";
import ViewportContext from "../context/ViewportContent";
import {SMALL_SCREEN_BREAKPOINT} from "../utils/breakpoints";


/**
 * Custom hook for checking if current width is smaller than small screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsSmallScreen = () => {
  const {width, isClient} = useContext(ViewportContext);

  if (!isClient) {
    return false;
  }

  return width < SMALL_SCREEN_BREAKPOINT;
}