import {ReactElement} from "react";
import {styles} from "./styles/NotFoundPageHeader.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import {AppRoutes} from "../../../utils/navigation";
import {DEFAULT_PRIMARY_BUTTON, WHITE} from "../../../utils/colors";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const TurnedOffLogo = '/assets/images/tuned-off-logo.png';
const HorizontalDivider = '/assets/images/separator-line-horizontal.png';

const NotFoundPageHeader = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.PageWrapper}>
      <div style={styles.HeroGradientBg}></div>
      <div style={styles.NotFoundPageHeader(isSmall)}>
        <img src={TurnedOffLogo} style={styles.Logo(isSmall)} alt={'turned off logo'}/>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Oops, we can't find that page.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Sorry, but the page you were looking for couldn't be found.</p>
        <div style={styles.ButtonContainer(isSmall)}>
          <CustomButton text={'Go To Home'}
                        link={AppRoutes.HOME}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
          />
        </div>
        <img src={HorizontalDivider} style={styles.HorizontalDivider(isSmall)} alt={'horizontal divider'}/>
        <p className={'fw-bold'} style={styles.ToolkitTitle(isSmall)}>Explore our toolkit solutions.</p>
        <p className={'fw-medium'} style={styles.ToolkitSubtitle(isSmall)}>Whether you're a consumer, an Internet provider or a policy maker, our toolkit has you covered.</p>
      </div>
    </div>
  )
}

export default NotFoundPageHeader;