import {RESPONSIVE_VERSION_BREAKPOINT, SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import {useContext} from "react";
import ViewportContext from "../context/ViewportContext";

/**
 * Custom hook for checking if current width is between small screen size
 * and medium screen size. Pulling current width from app's viewport context
 * provider.
 * @returns {boolean}
 */
export const useIsMediumSizeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width > SMALL_SCREEN_SIZE_BREAKPOINT && width <= RESPONSIVE_VERSION_BREAKPOINT;
}