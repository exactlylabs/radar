import {ReactElement} from "react";
import {styles} from "./styles/MobilePageHeader.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const MobileAppHero = '/assets/images/mobile-app-hero.png';
const StoresIcon = '/assets/images/stores-icon.png';

const MobilePageHeader = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.MobilePageHeader(isSmall)}>
      <div style={styles.MobilePageHeaderContent(isSmall)}>
        <div style={styles.TextContainer(isSmall)}>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Test your Wi-Fi or cellular connection and compare it to others in your region.</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Ensure you’re getting what you expect from your internet provider by testing the quality of your connection.</p>
          <div style={styles.ComingSoonContainer(isSmall)}>
            <img src={StoresIcon} style={styles.StoresIcon} alt={'stores'}/>
            <p className={'fw-medium'} style={styles.ComingSoonText}>Radar will be available for iOS and Android soon.</p>
          </div>
        </div>
        <img src={MobileAppHero} style={styles.HeroImage(isSmall)} alt={'mobile-app-hero'}/>
      </div>
    </div>
  );
}

export default MobilePageHeader;