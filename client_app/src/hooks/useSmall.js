import {SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import {useEffect, useState} from "react";

export const useSmall = () => {

  const [targetElement, setTargetElement] = useState(null);
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  useEffect(() => {
    const element = document.getElementById('main-frame');
    setIsMobileWidth(element.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT);
    setTargetElement(element)
  }, [])

  useEffect(() => {
    if(targetElement) {
      window.addEventListener('resize', () => setIsMobileWidth(targetElement.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT));
    }

    return () => window.removeEventListener('resize', () => setIsMobileWidth(targetElement.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT));
  });

  return isMobileWidth;
}