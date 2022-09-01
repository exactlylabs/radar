import {RESPONSIVE_VERSION_BREAKPOINT, SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import {useEffect, useState} from "react";

export const useMobile = () => {

  const [targetElement, setTargetElement] = useState(null);
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  const isWithinWidthRange = width => width > SMALL_SCREEN_SIZE_BREAKPOINT && width <= RESPONSIVE_VERSION_BREAKPOINT;

  useEffect(() => {
    const element = document.getElementById('main-frame');
    setIsMobileWidth(isWithinWidthRange(element.getBoundingClientRect().width));
    setTargetElement(element)
  }, [])

  useEffect(() => {
    if(targetElement) {
      window.addEventListener('resize', () => setIsMobileWidth(isWithinWidthRange(targetElement.getBoundingClientRect().width)));
    }

    return () => window.removeEventListener('resize', () => setIsMobileWidth(isWithinWidthRange(targetElement.getBoundingClientRect().width)));
  });

  return isMobileWidth;
}