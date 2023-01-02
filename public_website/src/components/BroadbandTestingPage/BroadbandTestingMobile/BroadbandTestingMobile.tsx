import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingMobile.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {goToMobile} from "../../../utils/navigation";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const MobileAppIllustration = '/assets/images/mobile-app-illustration.png';
const ChevronRightWhite = "/assets/images/chevron-right-white.png";

const BroadbandTestingMobile = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.BroadbandTestingMobile(isSmall)}>
      <div style={styles.BroadbandTestingMobileContent(isSmall)}>
        { !isSmall && <img src={MobileAppIllustration} style={styles.Illustration(isSmall)} alt={'mobile-app-illustration'}/> }
        <div style={styles.RightColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Header(isSmall)}>Radar for Mobile</p>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Test wifi and cellular connections with our mobile app.</p>
          <p className={'fw-medium'} style={styles.Paragraph(isSmall)}>Let your customers or community test their conectivity indoors and outdoors by using our mobile app for iOS and Android.</p>
          <CustomButton text={'Learn more'}
                        onClick={goToMobile}
                        icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
      </div>
      { isSmall && <img src={MobileAppIllustration} style={styles.Illustration(isSmall)} alt={'mobile-app-illustration'}/> }
    </div>
  );
}

export default BroadbandTestingMobile;