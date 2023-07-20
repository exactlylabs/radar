import {ReactElement} from "react";
import {styles} from "./styles/Footer.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import { AppRoutes } from "../../../utils/navigation";

const RadarLogoGray = '/assets/images/radar-logo-gray.png';
const ExactlyLogo = '/assets/images/exactly-logo.png';
const ANTHCLogo = '/assets/images/anthc-logo.png';
const XLabLogo = '/assets/images/xlab-logo.png';

interface FooterProps {
  isDifferentColor?: boolean;
  height?: string;
  margin?: string;
  smallFooterMarginTop?: string;
}

// Not doing 2 different components for viewport changes as they are
// pretty small components on their own and quite a lot of shared styles.
const Footer = ({isDifferentColor, height, margin, smallFooterMarginTop}: FooterProps): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const regularFooter = (
    <div style={styles.Footer(isDifferentColor, height)}>
      <div style={styles.FooterContent(margin)}>
        <div style={styles.TopRow}>
          <div style={styles.LeftColumn}>
            <img src={RadarLogoGray} style={styles.RadarLogo} alt={'radar-logo'}/>
            <a href={AppRoutes.PRIVACY_POLICY} style={styles.Link} className={'fw-bold hover-opaque'}>Privacy Policy</a>
          </div>
          <div style={styles.RightColumn}>
            <a href={'https://www.anthc.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
              <img src={ANTHCLogo} style={styles.ANTHCLogo} alt={'ANTHC-logo'}/>
            </a>
            <a href={'https://exactlylabs.com'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
              <img src={ExactlyLogo} style={styles.ExactlyLogo} alt={'ExactlyLabs logo'}/>
            </a>
            <a href={'https://thexlab.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
              <img src={XLabLogo} style={styles.XLabLogo} alt={'XLab logo'}/>
            </a>
          </div>
        </div>
        <div style={styles.BottomRow}>
          <p className={'fw-regular'} style={styles.Copyright}>{`Copyright © ${new Date().getFullYear()} Radar. All rights reserved.`}</p>
          <p className={'fw-regular'} style={styles.DeveloperInfo}>This project was developed as part of the Telehealth Broadband Pilot Program.<br/>The Telehealth Broadband Pilot Program is made possible by grant #GA540183 from the Office for the Advancement of Telehealth, Health Resources and Services Administration, DHHS.</p>
        </div>
      </div>
    </div>
  );

  const smallFooter = (
    <div style={styles.SmallFooter(isDifferentColor, smallFooterMarginTop)}>
      <div style={styles.SmallTopRow}>
        <img src={RadarLogoGray} style={styles.RadarLogo} alt={'radar-logo'}/>
        <div style={styles.LinkContainer}>
          <a href={'/privacy-policy'} style={styles.SmallLink} className={'fw-bold hover-opaque'}>Privacy Policy</a>
        </div>
      </div>
      <div style={styles.FooterHorizontalDivider}></div>
      <div style={styles.SmallMidRow}>
        <a href={'https://www.anthc.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
          <img src={ANTHCLogo} style={styles.SmallANTHCLogo} alt={'ANTHC-logo'}/>
        </a>
        <a href={'https://exactlylabs.com'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>  
          <img src={ExactlyLogo} style={styles.SmallExactlyLogo} alt={'ExactlyLabs logo'}/>
        </a>
        <a href={'https://thexlab.org/'} target={'_blank'} rel={'noreferrer'} style={styles.MarginlessLink}>
          <img src={XLabLogo} style={styles.SmallXLabLogo} alt={'XLab logo'}/>
        </a>
      </div>
      <p className={'fw-regular'} style={styles.Copyright}>{`Copyright © ${new Date().getFullYear()} Radar. All rights reserved.`}</p>
      <p className={'fw-regular'} style={styles.DeveloperInfo}>This project was developed as part of the Telehealth Broadband Pilot Program.<br/>The Telehealth Broadband Pilot Program is made possible by grant #GA540183 from the Office for the Advancement of Telehealth, Health Resources and Services Administration, DHHS.</p>
    </div>
  )

  return isSmall ? smallFooter : regularFooter;
}

export default Footer;