import {ReactElement} from "react";
import {styles} from "./styles/MobilePageHeader.style";
import MobileAppHero from '../../../assets/images/mobile-app-hero.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const MobilePageHeader = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.MobilePageHeader(isSmall)}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Test your wifi or cellular connection and compare it to others in your region.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Ensure you’re getting what you expect from your internet provider by testing the quality of your connection.</p>
      </div>
      <img src={MobileAppHero} style={styles.HeroImage(isSmall)} alt={'mobile-app-hero'}/>
    </div>
  );
}

export default MobilePageHeader;