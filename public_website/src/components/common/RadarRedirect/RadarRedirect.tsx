import {ReactElement} from "react";
import CustomButton from "../CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {DEFAULT_MAIL_TO, emailContact} from "../../../utils/navigation";
import {styles} from "./styles/RadarRedirect.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = "/assets/images/chevron-right-white.png";

interface RadarRedirectProps {
  marginTop?: string;
}

const Bg1 = '/assets/images/radar-redirection-1.png';
const Bg2 = '/assets/images/radar-redirection-2.png';
const Bg3 = '/assets/images/radar-redirection-3.png';
const Bg4 = '/assets/images/radar-redirection-4.png';
const Bg5 = '/assets/images/radar-redirection-5.png';
const SemiCircleSmall = '/assets/images/redirect-semi-circle-small.png';
const SemiCircleBig = '/assets/images/redirect-semi-circle-big.png';
const SmallBg1 = '/assets/images/small-redirect-1.png';
const SmallBg2 = '/assets/images/small-redirect-2.png';
const SmallBg3 = '/assets/images/small-redirect-3.png';
const SmallBg4 = '/assets/images/small-redirect-4.png';

const RadarRedirect = ({marginTop}: RadarRedirectProps): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.RadarRedirect(isSmall, marginTop)}>
      {!isSmall && <img src={Bg1} alt={'redirect section background light'} style={styles.Bg1}/> }
      {!isSmall && <img src={Bg2} alt={'redirect section background light'} style={styles.Bg2}/> }
      {!isSmall && <img src={Bg3} alt={'redirect section background light'} style={styles.Bg3}/> }
      {!isSmall && <img src={Bg4} alt={'redirect section background light'} style={styles.Bg4}/> }
      {!isSmall && <img src={Bg5} alt={'redirect section background light'} style={styles.Bg5}/> }
      {!isSmall && <img src={SemiCircleSmall} alt={'redirect section background circle'} style={styles.SemiCircleSmall}/> }
      {!isSmall && <img src={SemiCircleBig} alt={'redirect section background circle'} style={styles.SemiCircleBig}/> }
      { isSmall && <img src={SmallBg1} alt={'redirect section background circle'} style={styles.SmallBg1}/> }
      { isSmall && <img src={SmallBg2} alt={'redirect section background circle'} style={styles.SmallBg2}/> }
      { isSmall && <img src={SmallBg3} alt={'redirect section background circle'} style={styles.SmallBg3}/> }
      { isSmall && <img src={SmallBg4} alt={'redirect section background circle'} style={styles.SmallBg4}/> }
      { isSmall && <img src={SemiCircleSmall} alt={'redirect section background circle'} style={styles.SmallSemiCircleBig}/> }
      <div style={styles.RadarRedirectContent(isSmall)}>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Get started with Radar today.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Get in touch with us to find out how our solutions can help you.</p>
        <CustomButton text={'Get started'}
                      link={DEFAULT_MAIL_TO}
                      icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                      backgroundColor={DEFAULT_PRIMARY_BUTTON}
                      color={WHITE}
                      boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
        />
      </div>
    </div>
  );
}

export default RadarRedirect;