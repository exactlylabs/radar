import {ReactElement} from "react";
import {styles} from "./styles/MobilePageHeader.style";
import MobileAppHero from '../../../assets/images/mobile-app-hero.png';

const MobilePageHeader = (): ReactElement => (
  <div style={styles.MobilePageHeader}>
    <div style={styles.TextContainer}>
      <p className={'fw-extra-bold'} style={styles.Title}>Test your wifi or cellular connection and compare it to others in your region.</p>
      <p className={'fw-medium'} style={styles.Subtitle}>Ensure you’re getting what you expect from your internet provider by testing the quality of your connection.</p>
    </div>
    <img src={MobileAppHero} style={styles.HeroImage} alt={'mobile-app-hero-image'}/>
  </div>
);

export default MobilePageHeader;