import {useIsSmallSizeScreen} from "./useIsSmallScreen";
import {useIsMidSizeScreen} from "./useIsMidSizeScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallSizeScreen: boolean, isMidSizeScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallSizeScreen = useIsSmallSizeScreen();
  const isMidSizeScreen = useIsMidSizeScreen();
  const isSmallerThanMid = isSmallSizeScreen || isMidSizeScreen;
  return {isSmallSizeScreen, isMidSizeScreen, isSmallerThanMid};
}