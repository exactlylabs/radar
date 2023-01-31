import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingSpeedtest.style";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import CustomButton from "../../common/CustomButton/CustomButton";
import {DEFAULT_MAIL_TO, emailContact, goToSpeedTestWebsite} from "../../../utils/navigation";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = "/assets/images/chevron-right-white.png";

const BroadbandTestingSpeedtest = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const getSrc = () => `https://speedtest.staging.exactlylabs.com/?widgetMode=true&frameWidth=${isSmall ? '100%' : '600px'}&frameHeight=570px`

  return (
    <div style={styles.BroadbandTestingSpeedtest(isSmall)}>
      <div style={styles.BroadbandTestingSpeedtestContent(isSmall)}>
        <div style={styles.LeftColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Header(isSmall)}>Speed test integration</p>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Enable visitors to run speed tests from your website.</p>
          <p className={'fw-bold'} style={styles.Subtitle(isSmall)}>Add our white-labelable widget</p>
          <p className={'fw-medium'} style={styles.Paragraph(isSmall)}>Let your users run speed tests and compare their speeds against the broader community, while capturing optional information like service cost, location type and geolocation.
            Contact us for customization options as you prepare to launch this in the context of your own community.</p>
          <CustomButton text={'Get started'}
                        link={DEFAULT_MAIL_TO}
                        icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
        <div style={styles.RightColumn(isSmall)}>
          <iframe style={styles.Iframe(isSmall)} src={getSrc()}/>
        </div>
      </div>
    </div>
  );
}

export default BroadbandTestingSpeedtest;