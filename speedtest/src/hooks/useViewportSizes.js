import {useIsSmallSizeScreen} from "./useIsSmallSizeScreen";
import {useIsMediumSizeScreen} from "./useIsMediumSizeScreen";
import {useIsLargeSizeScreen} from "./useIsLargeSizeScreen";
import {useIsXLSizeScreen} from "./useIsXLSizeScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, isMediumSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallSizeScreen: boolean, isMediumSizeScreen: boolean, isLargeSizeScreen: boolean, isXLSizeScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallSizeScreen = useIsSmallSizeScreen();
  const isMediumSizeScreen = useIsMediumSizeScreen();
  const isLargeSizeScreen = useIsLargeSizeScreen();
  const isXLSizeScreen = useIsXLSizeScreen();
  return {isSmallSizeScreen, isMediumSizeScreen, isLargeSizeScreen, isXLSizeScreen};
}