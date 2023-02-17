import {ReactElement} from "react";
import {styles} from "./styles/ToolkitDetailSection.style";
import CustomButton from "../../common/CustomButton/CustomButton";
import {AppRoutes, ExternalRoutes, isProduction} from "../../../utils/navigation";
import {
  DEFAULT_PRIMARY_BUTTON,
  DEFAULT_PRIMARY_BUTTON_BOX_SHADOW,
  DETAIL_SECTION_BG,
  WHITE
} from "../../../utils/colors";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const SiteMonitoringIcon = '/assets/images/site-monitoring-icon.png';
const SiteMonitoringBackground = '/assets/images/site-monitoring-bg.png';
const SiteMonitoringBackgroundSmall = '/assets/images/site-monitoring-bg-small.png';
const ChevronRightWhite = '/assets/images/chevron-right-white.png';
const BroadbandTestingBackground = '/assets/images/broadband-testing-bg.png';
const BroadbandTestingIcon = '/assets/images/broadband-testing-icon.png';
const MappingIcon = '/assets/images/mapping-tools-icon.png';
const MappingToolsBackground = '/assets/images/mapping-tools-bg.png';
const RedirectArrowWhite = '/assets/images/redirect-arrow-white.png';

const ToolkitDetailSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen, isLargeScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.ToolkitDetailSection}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-bold'} style={styles.Header(isSmall)}>Our toolkit</p>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Powerful data-driven tools to make better investments.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our open-sourced toolkit allows you to analyze existing broadband data and collect unbiased information on Internet accessibility and affordability in your community.</p>
      </div>
      <div style={styles.DetailSection(isSmall, '6vw 0 9vw 0', false, true)}>
        {!isSmall && <div style={styles.Gradient('543px', 'linear-gradient(to top, #f2f4fd 38%, #fff 75%)')}></div>}
        <div style={styles.DetailSectionContent(isSmall)}>
          <div style={styles.InformationBlock(isSmall)}>
            <div style={styles.IconContainer(isSmall)}>
              <img src={SiteMonitoringIcon} style={styles.Icon} alt={'site-monitoring-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Site Monitoring</p>
            <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Remotely monitor your Internet quality and get better insights by analyzing the network performance over time.</p>
            <CustomButton text={'Learn more'}
                          link={AppRoutes.SITE_MONITORING}
                          icon={<img src={ChevronRightWhite} style={styles.Chevron} alt={'chevron-right-white'}/>}
                          backgroundColor={DEFAULT_PRIMARY_BUTTON}
                          color={WHITE}
                          boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
            />
          </div>
        </div>
        {!isSmallScreen && <img src={SiteMonitoringBackground} style={styles.SiteMonitoringBackground(isMidScreen, isLargeScreen)} alt={'site-monitoring-background'}/> }
        { isSmallScreen && <img src={SiteMonitoringBackgroundSmall} style={styles.SiteMonitoringBackgroundSmall} alt={'site-monitoring-background small'}/> }
      </div>
      <div style={styles.DetailSection(isSmall, '10vw 0 10vw 0')}>
        {!isSmall && <img src={BroadbandTestingBackground} style={styles.BroadbandTestingBackground(isMidScreen, isLargeScreen)} alt={'broadband-testing-background'}/>}
        <div style={styles.DetailSectionContent(isSmall)}>
          <div style={styles.InformationBlock(isSmall, '8.5%')}>
            <div style={styles.IconContainer(isSmall)}>
              <img src={BroadbandTestingIcon} style={styles.Icon} alt={'broadband-testing-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Consumer Broadband Testing</p>
            <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Capture detailed information about upload speeds, download speeds, and quality metrics for Internet connections with a white-label solution.</p>
            <CustomButton text={'Learn more'}
                          link={AppRoutes.BROADBAND_TESTING}
                          icon={<img src={ChevronRightWhite} style={styles.Chevron} alt={'chevron-right-white'}/>}
                          backgroundColor={DEFAULT_PRIMARY_BUTTON}
                          color={WHITE}
                          boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
            />
          </div>
        </div>
        {isSmall && <img src={BroadbandTestingBackground} style={styles.SmallBroadbandTestingBackground} alt={'broadband-testing-background'}/>}
      </div>
      <div style={styles.DetailSection(isSmall, '9vw 0 14vw 0',true)}>
        <div style={styles.DetailSectionContent(isSmall)}>
          <div style={styles.InformationBlock(isSmall)}>
            <div style={styles.IconContainer(isSmall)}>
              <img src={MappingIcon} style={styles.Icon} alt={'mapping-tools-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.InformationBlockTitle(isSmall)}>Mapping Tools</p>
            <p className={'fw-medium'} style={styles.InformationBlockSubtitle(isSmall)}>Explore public data on an interactive map to learn more about how Internet connectivity varies between different geographies, providers and timeframes.</p>
            <CustomButton text={'Explore the map'}
                          link={isProduction ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING}
                          openNewTab
                          icon={<img src={RedirectArrowWhite} style={styles.RedirectArrow} alt={'new tab arrow white'}/>}
                          backgroundColor={DEFAULT_PRIMARY_BUTTON}
                          color={WHITE}
                          boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
            />
          </div>
        </div>
        <img src={MappingToolsBackground} style={styles.MappingToolsBackground(isSmallScreen, isMidScreen, isLargeScreen)} alt={'mapping-tools-background'}/>
      </div>
    </div>
  )
}

export default ToolkitDetailSection;