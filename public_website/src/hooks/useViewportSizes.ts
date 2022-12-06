import {useIsSmallScreen} from "./useIsSmallScreen";
import {useIsMidScreen} from "./useIsMidScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallScreen = useIsSmallScreen();
  const isMidScreen = useIsMidScreen();
  return { isSmallScreen, isMidScreen };
}