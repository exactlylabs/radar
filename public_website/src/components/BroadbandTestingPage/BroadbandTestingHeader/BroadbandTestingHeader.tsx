import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingHeader.style";
import ChevronRightWhite from "../../../assets/images/chevron-right-white.png";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import CustomButton from "../../common/CustomButton/CustomButton";
import {goToHome} from "../../../utils/navigation";
import BroadbandTestingIllustration from '../../../assets/images/broadband-testing-illustration.png';

const BroadbandTestingHeader = (): ReactElement => (
  <div style={styles.BroadbandTestingHeader}>
    <div style={styles.TextContainer}>
      <p className={'fw-extra-bold'} style={styles.Title}>Do you know where broadband is missing?</p>
      <p className={'fw-medium'} style={styles.Subtitle}>Discover the neighborhoods and streets with the most needs and make the most out of your investment.</p>
      <CustomButton text={'Get started'}
                    onClick={goToHome}
                    icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                    backgroundColor={DEFAULT_PRIMARY_BUTTON}
                    color={WHITE}
                    boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
      />
    </div>
    <img src={BroadbandTestingIllustration} style={styles.Illustration} alt={'broadband-testing-illustration'}/>
  </div>
);

export default BroadbandTestingHeader;