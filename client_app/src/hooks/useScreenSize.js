import {RESPONSIVE_VERSION_BREAKPOINT} from "../utils/breakpoints";
import {useEffect, useState} from "react";

export const useScreenSize = () => {

  const [isMobileWidth, setIsMobileWidth] = useState(window.innerWidth <= RESPONSIVE_VERSION_BREAKPOINT);

  useEffect(() => {
    window.addEventListener('resize', () => setIsMobileWidth(window.innerWidth <= RESPONSIVE_VERSION_BREAKPOINT));

    return () => window.removeEventListener('resize', () => setIsMobileWidth(window.innerWidth <= RESPONSIVE_VERSION_BREAKPOINT));
  });

  return isMobileWidth;
}