import {
  LARGE_VERSION_BREAKPOINT,
  RESPONSIVE_VERSION_BREAKPOINT
} from "../utils/breakpoints";
import {useContext} from "react";
import ViewportContext from "../context/ViewportContext";

/**
 * Custom hook for checking if current width is between medium screen size
 * and large screen size. Pulling current width from app's viewport context
 * provider.
 * @returns {boolean}
 */
export const useIsLargeSizeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width > RESPONSIVE_VERSION_BREAKPOINT && width <= LARGE_VERSION_BREAKPOINT;
}