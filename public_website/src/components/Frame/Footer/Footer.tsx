import {ReactElement} from "react";
import {styles} from "./styles/Footer.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const RadarLogoGray = '/assets/images/radar-logo-gray.png';
const BroadbandMappingLogo = '/assets/images/broadband-mapping-logo.png';
const ANTHCLogo = '/assets/images/anthc-logo.png';
const MLabLogo = '/assets/images/mlab-logo.png';

// Not doing 2 different components for viewport changes as they are
// pretty small components on their own and quite a lot of shared styles.
const Footer = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const regularFooter = (
    <div style={styles.Footer}>
      <div style={styles.TopRow}>
        <div style={styles.LeftColumn}>
          <img src={RadarLogoGray} style={styles.RadarLogo} alt={'radar-logo'}/>
          <a href={'/privacy-policy'} style={styles.Link} className={'fw-bold hover-opaque'}>Privacy Policy</a>
          <a href={'/terms'} style={styles.Link} className={'fw-bold hover-opaque'}>Terms of Use</a>
        </div>
        <div style={styles.RightColumn}>
          <a href={'https://www.broadbandmapping.com/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
            <img src={BroadbandMappingLogo} style={styles.BroadbandMappingLogo} alt={'broadband-mapping-logo'}/>
          </a>
          <a href={'https://www.anthc.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
            <img src={ANTHCLogo} style={styles.ANTHCLogo} alt={'ANTHC-logo'}/>
          </a>
          <a href={'https://www.measurementlab.net/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
            <img src={MLabLogo} style={styles.MLabLogo} alt={'MLab-logo'}/>
          </a>
        </div>
      </div>
      <div style={styles.BottomRow}>
        <p className={'fw-regular'} style={styles.Copyright}>Copyright © 2022 Radar. All rights reserved.</p>
      </div>
    </div>
  );

  const smallFooter = (
    <div style={styles.SmallFooter}>
      <div style={styles.SmallTopRow}>
        <img src={RadarLogoGray} style={styles.RadarLogo} alt={'radar-logo'}/>
        <div style={styles.LinkContainer}>
          <a href={'/privacy-policy'} style={styles.SmallLink} className={'fw-bold hover-opaque'}>Privacy Policy</a>
          <a href={'/terms'} style={styles.SmallLink} className={'fw-bold hover-opaque'}>Terms of Use</a>
        </div>
      </div>
      <div style={styles.FooterHorizontalDivider}></div>
      <div style={styles.SmallMidRow}>
        <a href={'https://www.broadbandmapping.com/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
          <img src={BroadbandMappingLogo} style={styles.BroadbandMappingLogo} alt={'broadband-mapping-logo'}/>
        </a>
        <a href={'https://www.anthc.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
          <img src={ANTHCLogo} style={styles.SmallANTHCLogo} alt={'ANTHC-logo'}/>
        </a>
        <a href={'https://www.measurementlab.net/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
          <img src={MLabLogo} style={styles.SmallMLabLogo} alt={'MLab-logo'}/>
        </a>
      </div>
      <p className={'fw-regular'} style={styles.Copyright}>Copyright © 2022 Radar. All rights reserved.</p>
    </div>
  )

  return isSmall ? smallFooter : regularFooter;
}

export default Footer;