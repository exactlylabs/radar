import {ReactElement} from "react";
import CustomButton from "../CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {goToBase} from "../../../utils/navigation";
import ChevronRightWhite from "../../../assets/images/chevron-right-white.png";
import {styles} from "./styles/RadarRedirect.style";

const RadarRedirect = (): ReactElement => (
  <div style={styles.RadarRedirect}>
    <div style={styles.RadarRedirectContent}>
      <p className={'fw-extra-bold'} style={styles.Title}>Get started with Radar today.</p>
      <p className={'fw-medium'} style={styles.Subtitle}>Get in touch with us to find out how our solutions can help you.</p>
      <CustomButton text={'Get started'}
                    onClick={goToBase}
                    icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                    backgroundColor={DEFAULT_PRIMARY_BUTTON}
                    color={WHITE}
                    boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
      />
    </div>
  </div>
);

export default RadarRedirect;