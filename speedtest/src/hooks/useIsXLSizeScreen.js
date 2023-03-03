import {
  EXTRA_LARGE_VERSION_BREAKPOINT,
  LARGE_VERSION_BREAKPOINT
} from "../utils/breakpoints";
import {useContext} from "react";
import ViewportContext from "../context/ViewportContext";

/**
 * Custom hook for checking if current width is between large screen size
 * and xl screen size. Pulling current width from app's viewport context
 * provider.
 * @returns {boolean}
 */
export const useIsXLSizeScreen = () => {
  const {width} = useContext(ViewportContext);
  return width > LARGE_VERSION_BREAKPOINT && width <= EXTRA_LARGE_VERSION_BREAKPOINT;
}