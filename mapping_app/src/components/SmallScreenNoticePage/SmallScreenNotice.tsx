import {ReactElement} from "react";
import {styles} from "./styles/SmallScreenNotice.style";
import MobileLogo from '../../assets/mobile-logo.png';
import DevicesGif from '../../assets/devices-gif.gif';
import ArrowRight from '../../assets/arrow-right-black.png';
import AnthcLogo from '../../assets/anthc-logo.png';
import ExactlyLogo from '../../assets/exactly-logo.png';
import XlabLogo from '../../assets/xlab-logo.png';
import {goToExactlyLabsWebsite} from "../../utils/redirects";

interface SmallScreenNoticeProps {
  setWantsToProceed: (value: boolean) => void;
}

const SmallScreenNotice = ({ setWantsToProceed }: SmallScreenNoticeProps): ReactElement => {

  const proceedToRegularScreen = () => setWantsToProceed(true);

  return (
    <div style={styles.SmallScreenNotice}>
      <img src={MobileLogo} style={styles.Logo} alt={'mobile-logo'}/>
      <div style={styles.HorizontalDivider}></div>
      <img src={DevicesGif} style={styles.Gif} alt={'devices-gif'}/>
      <p className={'fw-medium'} style={styles.Title}>We're still working on a website version for mobile devices.</p>
      <p className={'fw-light'} style={styles.Text}>In the meantime, we highly recommend that you access our website on another device such as a laptop or desktop for the best experience.</p>
      <div style={styles.IgnoreContainer} className={'hover-opaque'} onClick={proceedToRegularScreen}>
        <p className={'fw-medium'} style={styles.IgnoreText}>Ignore and continue</p>
        <img src={ArrowRight} style={styles.Arrow} alt={'arrow-right'}/>
      </div>
      <div style={styles.Footer}>
        <div style={styles.FooterTextAndLogoContainer}>
          <p className={'fw-light'} style={styles.LightText}>In association with:</p>
          <div style={styles.FooterLogoContainer}>
            <img src={AnthcLogo} style={styles.AnthcLogo} alt={'ANTHC-logo'}/>
            <img src={ExactlyLogo} style={styles.ExactlyLogo} alt={'Exactly-logo'} onClick={goToExactlyLabsWebsite}/>
            <img src={XlabLogo} style={styles.XlabLogo} alt={'XLab-logo'}/>
          </div>
        </div>
        <div style={styles.HorizontalDivider}></div>
        <div style={styles.RightsTextContainer}>
          <p className={'fw-light'} style={styles.LightText}>Broadband Mapping © 2022.</p>
          <p className={'fw-light'} style={styles.LightText}>All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default SmallScreenNotice;