import {ReactElement} from "react";
import CustomButton from "../../common/CustomButton/CustomButton";
import {styles} from "./styles/ToolkitIntroductionSection.style";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import ToolkitIntroductionTable from "./ToolkitIntroductionTable/ToolkitIntroductionTable";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightWhite = '/assets/images/chevron-right-white.png';
const LeftHeroBg = '/assets/images/left-blue-hero-bg.png';
const RightHeroBg = '/assets/images/right-pink-hero-bg.png';
const OrangeHeroBg = '/assets/images/orange-hero-bg.png';

const ToolkitIntroductionSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();

  const isSmall = isSmallScreen || isMidScreen;

  const goToGetStarted = () => {

  }

  return (
    <div style={styles.MainWrapper}>
      <div style={styles.ToolkitIntroductionSection(isSmall)}>
        { !isSmall && <img src={LeftHeroBg} alt={'blue home hero background'} style={styles.BlueHeroBg(isSmall)}/> }
        { !isSmall && <img src={OrangeHeroBg} alt={'orange home hero background'} style={styles.OrangeHeroBg(isSmall)}/> }
        { !isSmall && <img src={RightHeroBg} alt={'blue home hero background'} style={styles.PinkHeroBg(isSmall)}/> }
        <div style={styles.TextContainer(isSmall)}>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Make better broadband decisions.</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our platform provides you with the insights, tools and resources you need to make better investments in broadband at the community, county, and country level.</p>
          <div style={styles.ButtonContainer}>
            <CustomButton text={'Get started'}
                          onClick={goToGetStarted}
                          icon={<img src={ChevronRightWhite} style={styles.ChevronRight} alt={'chevron-right'}/>}
                          backgroundColor={DEFAULT_PRIMARY_BUTTON}
                          color={WHITE}
                          boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
            />
          </div>
          { isSmall && <img src={LeftHeroBg} alt={'blue home hero background'} style={styles.BlueHeroBg(isSmall)}/> }
          { isSmall && <img src={OrangeHeroBg} alt={'orange home hero background'} style={styles.OrangeHeroBg(isSmall)}/> }
          { isSmall && <img src={RightHeroBg} alt={'blue home hero background'} style={styles.PinkHeroBg(isSmall)}/> }
        </div>
        <ToolkitIntroductionTable />
      </div>
    </div>
  )
}

export default ToolkitIntroductionSection;