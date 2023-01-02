import {ReactElement} from "react";
import {styles} from "./styles/ToolkitDetailSection.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import {goToBroadbandTesting, goToSiteMonitoring, goToUrl} from "../../../utils/navigation";
import {
  DEFAULT_PRIMARY_BUTTON,
  DEFAULT_PRIMARY_BUTTON_BOX_SHADOW,
  DETAIL_SECTION_BG,
  WHITE
} from "../../../utils/colors";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const SiteMonitoringIcon = '/assets/images/site-monitoring-icon.png';
const SiteMonitoringBackground = '/assets/images/site-monitoring-bg.png';
const ChevronRightWhite = '/assets/images/chevron-right-white.png';
const BroadbandTestingBackground = '/assets/images/broadband-testing-bg.png';
const BroadbandTestingIcon = '/assets/images/broadband-testing-icon.png';
const MappingIcon = '/assets/images/mapping-tools-icon.png';
const MappingToolsBackground = '/assets/images/mapping-tools-bg.png';

const ToolkitDetailSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const goToExploreTheMap = () => goToUrl('/map');

  return (
    <div style={styles.ToolkitDetailSection}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-bold'} style={styles.Header(isSmall)}>Our toolkit</p>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Powerful data-driven tools to make better investments.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our open-sourced toolkit allows you to analyze existing broadband data as well as collect un-biased information on how accessible and affordable the internet is in your communities.</p>
      </div>
      <div style={styles.DetailSection(isSmall)}>
        {!isSmall && <div style={styles.Gradient('543px', 'linear-gradient(to top, #f2f4fd 38%, #fff 75%)')}></div>}
        <div style={styles.InformationBlock(isSmall)}>
          <div style={styles.IconContainer}>
            <img src={SiteMonitoringIcon} style={styles.Icon} alt={'site-monitoring-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Site Monitoring</p>
          <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Monitor your sites’ internet quality remotely and get better insights by analyzing the network performance over time.</p>
          <CustomButton text={'Learn more'}
                        onClick={goToSiteMonitoring}
                        icon={<img src={ChevronRightWhite} style={styles.Chevron} alt={'chevron-right-white'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
        <img src={SiteMonitoringBackground} style={styles.SiteMonitoringBackground(isSmall)} alt={'site-monitoring-background'}/>
      </div>
      <div style={styles.DetailSection(isSmall)}>
        {!isSmall && <img src={BroadbandTestingBackground} style={styles.BroadbandTestingBackground} alt={'broadband-testing-background'}/>}
        <div style={styles.InformationBlock(isSmall, '12%')}>
          <div style={styles.IconContainer}>
            <img src={BroadbandTestingIcon} style={styles.Icon} alt={'broadband-testing-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Consumer Broadband Testing</p>
          <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Capture detailed information beyond what consumers are getting from their internet connections with a white-label solution.</p>
          <CustomButton text={'Learn more'}
                        onClick={goToBroadbandTesting}
                        icon={<img src={ChevronRightWhite} style={styles.Chevron} alt={'chevron-right-white'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
        {isSmall && <img src={BroadbandTestingBackground} style={styles.SmallBroadbandTestingBackground} alt={'broadband-testing-background'}/>}
      </div>
      <div style={styles.DetailSection(isSmall)}>
        { !isSmall && <div style={styles.Fill('623px', DETAIL_SECTION_BG)}></div> }
        <div style={styles.InformationBlock(isSmall)}>
          <div style={styles.IconContainer}>
            <img src={MappingIcon} style={styles.Icon} alt={'mapping-tools-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Mapping Tools</p>
          <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Explore public data on an interactive map to learn more about how internet connectivity varies between different geographies, providers and timeframes.</p>
          <CustomButton text={'Explore the map'}
                        onClick={goToExploreTheMap}
                        icon={<img src={ChevronRightWhite} style={styles.Chevron} alt={'chevron-right-white'}/>}
                        backgroundColor={DEFAULT_PRIMARY_BUTTON}
                        color={WHITE}
                        boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
          />
        </div>
        <img src={MappingToolsBackground} style={styles.MappingToolsBackground(isSmall)} alt={'mapping-tools-background'}/>
      </div>
    </div>
  )
}

export default ToolkitDetailSection;