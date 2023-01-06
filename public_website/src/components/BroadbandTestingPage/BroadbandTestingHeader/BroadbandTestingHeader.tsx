import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingHeader.style";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import CustomButton from "../../common/CustomButton/CustomButton";
import {goToHome} from "../../../utils/navigation";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = "/assets/images/chevron-right-white.png";
const BroadbandTestingIllustration = '/assets/images/broadband-testing-illustration.png';

const BroadbandTestingHeader = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.BroadbandTestingHeader(isSmall)}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Where are the gaps in you broadband maps?</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Discover the neighborhoods and streets with the most needs and make the most out of your investment.</p>
        <CustomButton text={'Get started'}
                      onClick={goToHome}
                      icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                      backgroundColor={DEFAULT_PRIMARY_BUTTON}
                      color={WHITE}
                      boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
        />
      </div>
      <img src={BroadbandTestingIllustration} style={styles.Illustration(isSmall)} alt={'broadband-testing-illustration'}/>
    </div>
  );
}

export default BroadbandTestingHeader;