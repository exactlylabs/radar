import {ReactElement, useRef, useState} from "react";
import {styles} from "../styles/MobilePageCarrousel.style";
import MobilePageCarrouselItem from "../MobilePageCarrouselItem/MobilePageCarrouselItem";
import {CarrouselItem, carrouselItemSubtitles, carrouselItemTitles, itemImageSrc} from "../MobilePageCarrousel";

const SpeedTestIcon = "/assets/images/carrousel-item-speed-test-icon.png";
const CompareIcon = "/assets/images/carrousel-item-compare-icon.png";
const PerformanceIcon = "/assets/images/carrousel-item-performance-icon.png";
const TransparencyIcon = "/assets/images/carrousel-item-transparency-icon.png";

interface SmallMobilePageCarrouselProps {
  currentItem: CarrouselItem;
  progress: number;
  handleManualSelect: (option: number) => void;
}

type ScrollPosition = {
  clientX: number;
  scrollX: number;
}

const SmallMobilePageCarrousel = ({
  currentItem,
  progress,
  handleManualSelect
}: SmallMobilePageCarrouselProps): ReactElement => {

  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({clientX: 0, scrollX: 0});
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrolling(true);
    setScrollPosition({clientX: e.clientX, scrollX: scrollPosition.scrollX});
  }

  const turnOffSlider = () => {
    setIsScrolling(false);
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    const {clientX, scrollX} = scrollPosition;
    if(isScrolling && !!sliderRef.current) {
      const scroll: number = scrollX + e.clientX - clientX;
      sliderRef.current.scrollLeft = scroll;
      setScrollPosition({scrollX: scroll, clientX: e.clientX});
    }
  }

  return (
    <div style={styles.SmallCarrouselContainer}>
      <img src={itemImageSrc[currentItem]} style={styles.CarrouselImage(true)} alt={'mobile-app-carrousel'}/>
      <div style={styles.HorizontalCarrousel}
           ref={sliderRef}
           className={'draggable-carrousel-container'}
           onMouseDown={handleMouseDown}
           onMouseUp={turnOffSlider}
           onMouseMove={handleMouseMove}
           draggable={true}
      >
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.SPEED_TESTS}
                                 progress={progress}
                                 icon={<img src={SpeedTestIcon} style={styles.Icon} alt={'speed-test-icon'}/>}
                                 title={carrouselItemTitles[CarrouselItem.SPEED_TESTS]}
                                 subtitle={carrouselItemSubtitles[CarrouselItem.SPEED_TESTS]}
                                 index={CarrouselItem.SPEED_TESTS}
                                 setSelectedItem={handleManualSelect}
                                 isFirst
        />
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.COMPARE}
                                 progress={progress}
                                 icon={<img src={CompareIcon} style={styles.Icon} alt={'compare-icon'}/>}
                                 title={carrouselItemTitles[CarrouselItem.COMPARE]}
                                 subtitle={carrouselItemSubtitles[CarrouselItem.COMPARE]}
                                 index={CarrouselItem.COMPARE}
                                 setSelectedItem={handleManualSelect}
        />
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.PERFORMANCE}
                                   progress={progress}
                                   icon={<img src={PerformanceIcon} style={styles.Icon} alt={'performance-icon'}/>}
                                   title={carrouselItemTitles[CarrouselItem.PERFORMANCE]}
                                   subtitle={carrouselItemSubtitles[CarrouselItem.PERFORMANCE]}
                                   index={CarrouselItem.PERFORMANCE}
                                   setSelectedItem={handleManualSelect}
        />
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.TRANSPARENCY}
                                 progress={progress}
                                 icon={<img src={TransparencyIcon} style={styles.Icon} alt={'transparency-icon'}/>}
                                 title={carrouselItemTitles[CarrouselItem.TRANSPARENCY]}
                                 subtitle={carrouselItemSubtitles[CarrouselItem.TRANSPARENCY]}
                                 index={CarrouselItem.TRANSPARENCY}
                                 setSelectedItem={handleManualSelect}
                                 isLast
        />
      </div>
    </div>
  )
}

export default SmallMobilePageCarrousel;