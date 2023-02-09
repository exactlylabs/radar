import {useIsSmallScreen} from "./useIsSmallScreen";
import {useIsMidScreen} from "./useIsMidScreen";
import {useIsLargeScreen} from "./useIsLargeScreen";
import {useIsXLScreen} from "./useIsXLScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallScreen: boolean, isMidScreen: boolean, isLargeScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallScreen = useIsSmallScreen();
  const isMidScreen = useIsMidScreen();
  const isLargeScreen = useIsLargeScreen();
  const isXLScreen = useIsXLScreen();
  return { isSmallScreen, isMidScreen, isLargeScreen, isXLScreen };
}