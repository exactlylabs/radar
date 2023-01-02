import {ReactElement, useEffect, useRef, useState} from "react";
import {styles} from "./styles/MobilePageCarrousel.style";
import {Optional} from "../../../utils/types";
import SmallMobilePageCarrousel from "./SmallMobilePageCarrousel/SmallMobilePageCarrousel";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import RegularMobilePageCarrousel from "./RegularMobilePageCarrousel/RegularMobilePageCarrousel";

const AppFeature0 = '/assets/images/app-feature-0.png';
const AppFeature1 = '/assets/images/app-feature-1.png';
const AppFeature2 = '/assets/images/app-feature-2.png';
const AppFeature3 = '/assets/images/app-feature-3.png';

export enum CarrouselItem {
  SPEED_TESTS,
  COMPARE,
  PERFORMANCE,
  TRANSPARENCY
}

export const carrouselItemTitles: Array<string> = [
  'Run speed tests',
  'Compare with others',
  'Keep track of performance',
  'Transparency to everyone'
];

export const carrouselItemSubtitles: Array<string> = [
  'Get detailed information about your current connectivity conditions.',
  'See how broadband in your neighboorhood compares to yours.',
  'Check your history to know how your connectivity performs over time.',
  'Let your community know how broadband prices and quality vary.'
];

export const itemImageSrc: Array<string> = [
  AppFeature0,
  AppFeature1,
  AppFeature2,
  AppFeature3
];

const MobilePageCarrousel = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const [currentItem, setCurrentItem] = useState(0);
  const [progress, setProgress] = useState(0);
  let timer = useRef<Optional<NodeJS.Timer>>(null);
  let progressTimer = useRef<Optional<NodeJS.Timer>>(null);

  useEffect(() => {
    timer.current = setInterval(() => { setCurrentItem(prevItem => ++prevItem % 4); }, 5000);
    return () => { if(timer.current) clearInterval(timer.current); };
  }, []);

  useEffect(() => {
    setProgress(0);
    progressTimer.current = setInterval(() => { setProgress(prevProgress => (prevProgress + 2) % 100); }, 100);
    return () => {
      if(progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [currentItem]);

  const handleManualSelect = (newItem: number) => {
    if(timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => { setCurrentItem(prevItem => ++prevItem % 4); }, 5000);
    setCurrentItem(newItem);
  }

  return (
    <div style={styles.MobilePageCarrousel}>
      <div style={styles.TextContainer}>
        <p className={'fw-bold'} style={styles.Header}>Radar for Mobile</p>
        <p className={'fw-extra-bold'} style={styles.Title}>Test your connectivity outdoors or your wifi at home.</p>
        <p className={'fw-medium'} style={styles.Subtitle}>Radar lets you run speed tests outdoors and indoors, compare results over time, and explore your neighborhood to get a better idea of how broadband looks like around you.</p>
      </div>
      { isSmall ?
        <SmallMobilePageCarrousel currentItem={currentItem}
                                  handleManualSelect={handleManualSelect}
                                  progress={progress}
        /> :
        <RegularMobilePageCarrousel currentItem={currentItem}
                                    handleManualSelect={handleManualSelect}
                                    progress={progress}
        />
      }
    </div>
  );
}

export default MobilePageCarrousel;