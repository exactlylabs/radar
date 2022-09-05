import {SMALL_SCREEN_SIZE_BREAKPOINT} from "../utils/breakpoints";
import {useEffect, useState} from "react";

export const useIsSmallSizeScreen = () => {

  const [targetElement, setTargetElement] = useState(null);
  const [isSmallWidth, setIsSmallWidth] = useState(false);

  useEffect(() => {
    const element = document.getElementById('main-frame');
    setIsSmallWidth(element.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT);
    setTargetElement(element)
  }, [])

  useEffect(() => {
    if(targetElement) {
      window.addEventListener('resize', () => setIsSmallWidth(targetElement.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT));
    }

    return () => window.removeEventListener('resize', () => setIsSmallWidth(targetElement.getBoundingClientRect().width <= SMALL_SCREEN_SIZE_BREAKPOINT));
  });

  return isSmallWidth;
}