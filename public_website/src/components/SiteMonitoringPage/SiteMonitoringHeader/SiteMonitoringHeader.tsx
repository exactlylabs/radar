import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringHeader.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {DEFAULT_MAIL_TO, emailContact, goToBase} from "../../../utils/navigation";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = "/assets/images/chevron-right-white.png";
const SiteMonitoringCards = '/assets/images/site-monitoring-cards.png';
const HeroBlueBg = '/assets/images/site-monitoring-hero-blue.png';
const HeroOrangeBg = '/assets/images/site-monitoring-hero-orange.png';
const HeroMapBg = '/assets/images/site-monitoring-hero-map.png';
const SmallHeroBg = '/assets/images/site-monitoring-hero-small.png';

const SiteMonitoringHeader = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.SiteMonitoringHeader(isSmall)}>
      {isSmall && <img src={SmallHeroBg} alt={'hero map background'} style={styles.SmallHeroBg}/>}
      <div style={styles.SiteMonitoringHeaderContent}>
        {!isSmall && <img src={HeroBlueBg} alt={'hero blue background'} style={styles.HeroBlueBg}/> }
        {!isSmall && <img src={HeroOrangeBg} alt={'hero orange background'} style={styles.HeroOrangeBg}/> }
        {!isSmall && <img src={HeroMapBg} alt={'hero map background'} style={styles.HeroMapBg}/> }
        <div style={styles.TextContainer(isSmall)}>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Is your Internet Service Provider letting you down?</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Ensure your Internet speed and quality meets expectations with our performance monitoring tools.</p>
          <CustomButton text={'Get started'}
                        onClick={emailContact}
                        link={DEFAULT_MAIL_TO}
                        icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
        <img src={SiteMonitoringCards} style={styles.Cards(isSmall)} alt={'site-monitoring-cards'}/>
      </div>
    </div>
  );
}

export default SiteMonitoringHeader;