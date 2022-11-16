import {useContext} from "react";
import {
  LARGE_SCREEN_SIZE_BREAKPOINT,
  MID_SCREEN_SIZE_BREAKPOINT,
  SMALL_SCREEN_SIZE_BREAKPOINT
} from "../utils/breakpoints";
import ViewportContext from "../context/ViewportContent";

/**
 * Custom hook for checking if current width is between small and medium screen size.
 * Pulling current width from app's viewport context provider.
 * @returns {boolean}
 */
export const useIsLargeTabletScreen = () => {
  const {width} = useContext(ViewportContext);
  return width >= MID_SCREEN_SIZE_BREAKPOINT && width < LARGE_SCREEN_SIZE_BREAKPOINT;
}