import {useContext} from "react";
import {EXTRA_SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import ViewportContext from "../context/ViewportContext";

/**
 * Custom hook for checking if current width is smaller than xs screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsXSSizeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width <= EXTRA_SMALL_SCREEN_SIZE_BREAKPOINT;
}