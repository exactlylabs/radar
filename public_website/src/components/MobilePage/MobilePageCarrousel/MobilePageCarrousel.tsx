import {ReactElement, useEffect, useRef, useState} from "react";
import {styles} from "./styles/MobilePageCarrousel.style";
import MobilePageCarrouselItem from "./MobilePageCarrouselItem/MobilePageCarrouselItem";
import AppFeature0 from '../../../assets/images/app-feature-0.png';
import AppFeature1 from '../../../assets/images/app-feature-1.png';
import AppFeature2 from '../../../assets/images/app-feature-2.png';
import AppFeature3 from '../../../assets/images/app-feature-3.png';
import SpeedTestIcon from '../../../assets/images/carrousel-item-speed-test-icon.png';
import CompareIcon from '../../../assets/images/carrousel-item-compare-icon.png';
import PerformanceIcon from '../../../assets/images/carrousel-item-performance-icon.png';
import TransparencyIcon from '../../../assets/images/carrousel-item-transparency-icon.png';
import {Optional} from "../../../utils/types";

enum CarrouselItems {
  SPEED_TESTS,
  COMPARE,
  PERFORMANCE,
  TRANSPARENCY
}

const carrouselItemTitles: Array<string> = [
  'Run speed tests',
  'Compare with others',
  'Keep track of performance',
  'Transparency to everyone'
];

const carrouselItemSubtitles: Array<string> = [
  'Get detailed information about your current connectivity conditions.',
  'See how broadband in your neighboorhood compares to yours.',
  'Check your history to know how your connectivity performs over time.',
  'Let your community know how broadband prices and quality vary.'
];

const itemImageSrc: Array<string> = [
  AppFeature0,
  AppFeature1,
  AppFeature2,
  AppFeature3
];

const MobilePageCarrousel = (): ReactElement => {

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
      <div style={styles.CarrouselContainer}>
        <div style={styles.LeftColumn}>
          <MobilePageCarrouselItem selected={currentItem === CarrouselItems.SPEED_TESTS}
                                   progress={progress}
                                   icon={<img src={SpeedTestIcon} style={styles.Icon} alt={'speed-test-icon'}/>}
                                   title={carrouselItemTitles[CarrouselItems.SPEED_TESTS]}
                                   subtitle={carrouselItemSubtitles[CarrouselItems.SPEED_TESTS]}
                                   index={CarrouselItems.SPEED_TESTS}
                                   setSelectedItem={handleManualSelect}
          />
          <MobilePageCarrouselItem selected={currentItem === CarrouselItems.COMPARE}
                                   progress={progress}
                                   icon={<img src={CompareIcon} style={styles.Icon} alt={'compare-icon'}/>}
                                   title={carrouselItemTitles[CarrouselItems.COMPARE]}
                                   subtitle={carrouselItemSubtitles[CarrouselItems.COMPARE]}
                                   index={CarrouselItems.COMPARE}
                                   setSelectedItem={handleManualSelect}
          />
        </div>
        <img src={itemImageSrc[currentItem]} style={styles.CarrouselImage} alt={'mobile-app-carrousel-image'}/>
        <div style={styles.RightColumn}>
          <MobilePageCarrouselItem selected={currentItem === CarrouselItems.PERFORMANCE}
                                   progress={progress}
                                   icon={<img src={PerformanceIcon} style={styles.Icon} alt={'performance-icon'}/>}
                                   title={carrouselItemTitles[CarrouselItems.PERFORMANCE]}
                                   subtitle={carrouselItemSubtitles[CarrouselItems.PERFORMANCE]}
                                   index={CarrouselItems.PERFORMANCE}
                                   setSelectedItem={handleManualSelect}
          />
          <MobilePageCarrouselItem selected={currentItem === CarrouselItems.TRANSPARENCY}
                                   progress={progress}
                                   icon={<img src={TransparencyIcon} style={styles.Icon} alt={'transparency-icon'}/>}
                                   title={carrouselItemTitles[CarrouselItems.TRANSPARENCY]}
                                   subtitle={carrouselItemSubtitles[CarrouselItems.TRANSPARENCY]}
                                   index={CarrouselItems.TRANSPARENCY}
                                   setSelectedItem={handleManualSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default MobilePageCarrousel;