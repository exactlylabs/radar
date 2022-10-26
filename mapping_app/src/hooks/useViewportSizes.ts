import {useIsSmallSizeScreen} from "./useIsSmallScreen";

/**
 * Custom hook for retrieving current comparisons for screen sizes.
 * Most of the time we would be checking for every screen size breakpoint we have in
 * one component at the same time, so pulling the entire object comes in
 * handy to do something like:
 * const {isSmallSizeScreen, ...} = useViewportSizes();
 * @returns {{isSmallSizeScreen: boolean}}
 */
export const useViewportSizes = () => {
  const isSmallSizeScreen = useIsSmallSizeScreen();
  return {isSmallSizeScreen};
}