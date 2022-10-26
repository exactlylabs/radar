import {useContext} from "react";
import {SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import ViewportContext from "../context/ViewportContent";


/**
 * Custom hook for checking if current width is smaller than small screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsSmallSizeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width <= SMALL_SCREEN_SIZE_BREAKPOINT;
}