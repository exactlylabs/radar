import {ReactElement} from "react";
import {CarrouselItem, carrouselItemSubtitles, carrouselItemTitles, itemImageSrc} from "../MobilePageCarrousel";
import {styles} from "../styles/MobilePageCarrousel.style";
import MobilePageCarrouselItem from "../MobilePageCarrouselItem/MobilePageCarrouselItem";

const SpeedTestIcon = "/assets/images/carrousel-item-speed-test-icon.png";
const CompareIcon = "/assets/images/carrousel-item-compare-icon.png";
const PerformanceIcon = "/assets/images/carrousel-item-performance-icon.png";
const TransparencyIcon = "/assets/images/carrousel-item-transparency-icon.png";

interface RegularMobilePageCarrouselProps {
  currentItem: CarrouselItem;
  progress: number;
  handleManualSelect: (option: number) => void;
}

const RegularMobilePageCarrousel = ({
  currentItem,
  progress,
  handleManualSelect
}: RegularMobilePageCarrouselProps): ReactElement => {

  return (
    <div style={styles.CarrouselContainer}>
      <div style={styles.LeftColumn}>
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.SPEED_TESTS}
                                 progress={progress}
                                 icon={<img src={SpeedTestIcon} style={styles.Icon} alt={'speed-test-icon'}/>}
                                 title={carrouselItemTitles[CarrouselItem.SPEED_TESTS]}
                                 subtitle={carrouselItemSubtitles[CarrouselItem.SPEED_TESTS]}
                                 index={CarrouselItem.SPEED_TESTS}
                                 setSelectedItem={handleManualSelect}
        />
        <MobilePageCarrouselItem selected={currentItem === CarrouselItem.COMPARE}
                                 progress={progress}
                                 icon={<img src={CompareIcon} style={styles.Icon} alt={'compare-icon'}/>}
                                 title={carrouselItemTitles[CarrouselItem.COMPARE]}
                                 subtitle={carrouselItemSubtitles[CarrouselItem.COMPARE]}
                                 index={CarrouselItem.COMPARE}
                                 setSelectedItem={handleManualSelect}
        />
      </div>
      <img src={itemImageSrc[currentItem]} style={styles.CarrouselImage(false)} alt={'mobile-app-carrousel'}/>
      <div style={styles.RightColumn}>
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
        />
      </div>
    </div>
  );
}

export default RegularMobilePageCarrousel;