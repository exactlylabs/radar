import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringHeader.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import ChevronRightWhite from "../../../assets/images/chevron-right-white.png";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {goToBase} from "../../../utils/navigation";
import SiteMonitoringCards from '../../../assets/images/site-monitoring-cards.png';
import SiteMonitoringBackground from '../../../assets/images/site-monitoring-cards-bg.png';

const SiteMonitoringHeader = (): ReactElement => (
  <div style={styles.SiteMonitoringHeader}>
    <div style={styles.TextContainer}>
      <p className={'fw-extra-bold'} style={styles.Title}>Getting what you paid for from your internet provider?</p>
      <p className={'fw-medium'} style={styles.Subtitle}>Ensure sites’ internet connectivity quality matches your expectations by continuous monitoring.</p>
      <CustomButton text={'Get started'}
                    onClick={goToBase}
                    icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                    backgroundColor={DEFAULT_PRIMARY_BUTTON}
                    color={WHITE}
                    boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
      />
    </div>
    <img src={SiteMonitoringCards} style={styles.Cards} alt={'site-monitoring-cards'}/>
    {/*<img src={SiteMonitoringBackground} style={styles.Background} alt={'site-monitoring-bg'}/>*/}
    {/*<img src={RedShape} style={styles.RedShape} alt={'red-shape'}/>
    <img src={BlueShape} style={styles.BlueShape} alt={'blue-shape'}/>*/}
  </div>
);

export default SiteMonitoringHeader;