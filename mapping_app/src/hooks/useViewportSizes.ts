import {useIsSmallScreen} from "./useIsSmallScreen";
import {useIsSmallTabletScreen} from "./useIsSmallTabletScreen";
import {useIsLargeTabletScreen} from "./useIsLargeTabletScreen";
import {useIsDesktopScreen} from "./useIsDesktopScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallSizeScreen: boolean, isSmallTabletScreen: boolean, isLargeTabletScreen: boolean, isDesktopScreen: boolean, isTabletScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallScreen = useIsSmallScreen();
  const isSmallTabletScreen = useIsSmallTabletScreen();
  const isLargeTabletScreen = useIsLargeTabletScreen();
  const isDesktopScreen = useIsDesktopScreen();
  const isTabletScreen = isSmallTabletScreen || isLargeTabletScreen;
  return {
    isSmallScreen,
    isSmallTabletScreen,
    isLargeTabletScreen,
    isDesktopScreen,
    isTabletScreen,
  };
}