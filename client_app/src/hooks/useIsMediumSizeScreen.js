import {RESPONSIVE_VERSION_BREAKPOINT, SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import {useEffect, useState} from "react";

export const useIsMediumSizeScreen = () => {

  const [targetElement, setTargetElement] = useState(null);
  const [isMediumWidth, setIsMediumWidth] = useState(false);

  const isWithinWidthRange = width => width > SMALL_SCREEN_SIZE_BREAKPOINT && width <= RESPONSIVE_VERSION_BREAKPOINT;

  useEffect(() => {
    const element = document.getElementById('main-frame');
    setIsMediumWidth(isWithinWidthRange(element.getBoundingClientRect().width));
    setTargetElement(element)
  }, [])

  useEffect(() => {
    if(targetElement) {
      window.addEventListener('resize', () => setIsMediumWidth(isWithinWidthRange(targetElement.getBoundingClientRect().width)));
    }

    return () => window.removeEventListener('resize', () => setIsMediumWidth(isWithinWidthRange(targetElement.getBoundingClientRect().width)));
  });

  return isMediumWidth;
}