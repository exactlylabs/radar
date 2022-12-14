import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingMobile.style";
import MobileAppIllustration from '../../../assets/images/mobile-app-illustration.png';
import CustomButton from "../../common/CustomButton/CustomButton";
import ChevronRightWhite from "../../../assets/images/chevron-right-white.png";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {goToMobile} from "../../../utils/navigation";

const BroadbandTestingMobile = (): ReactElement => (
  <div style={styles.BroadbandTestingMobile}>
    <div style={styles.BroadbandTestingMobileContent}>
      <img src={MobileAppIllustration} style={styles.Illustration} alt={'mobile-app-illustration'}/>
      <div style={styles.RightColumn}>
        <p className={'fw-bold'} style={styles.Header}>Radar for Mobile</p>
        <p className={'fw-extra-bold'} style={styles.Title}>Test wifi and cellular connections with our mobile app.</p>
        <p className={'fw-medium'} style={styles.Paragraph}>Let your customers or community test their conectivity indoors and outdoors by using our mobile app for iOS and Android.</p>
        <CustomButton text={'Learn more'}
                      onClick={goToMobile}
                      icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                      backgroundColor={DEFAULT_PRIMARY_BUTTON}
                      color={WHITE}
                      boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
        />
      </div>
    </div>
  </div>
);

export default BroadbandTestingMobile;