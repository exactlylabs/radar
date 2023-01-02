import {ReactElement} from "react";
import CustomButton from "../../common/CustomButton/CustomButton";
import {styles} from "./styles/ToolkitIntroductionSection.style";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import ToolkitIntroductionTable from "./ToolkitIntroductionTable/ToolkitIntroductionTable";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = '/assets/images/chevron-right-white.png';

const ToolkitIntroductionSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();

  const isSmall = isSmallScreen || isMidScreen;

  const goToGetStarted = () => {

  }

  return (
    <div style={styles.ToolkitIntroductionSection(isSmall)}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Bring broadband where it makes sense.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our toolkit provides you better insights into broadband needs and let you figure out where internet investment should be done both at the community and country levels.</p>
        <div style={styles.ButtonContainer}>
          <CustomButton text={'Get started'}
                        onClick={goToGetStarted}
                        icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
      </div>
      <ToolkitIntroductionTable />
    </div>
  )
}

export default ToolkitIntroductionSection;