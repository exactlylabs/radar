import {ReactElement} from "react";
import {styles} from "./styles/SmallNavbarContentOpen.style";
import NavbarHorizontalDivider from "./NavbarHorizontalDivider/NavbarHorizontalDivider";
import ToolkitTabContentRow
  from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/ToolkitTabContentRow/ToolkitTabContentRow";
import {ToolkitTabContentRowTitle} from "../../RegularNavbarContent/ToolkitFloatingMenu/types";
import {
  commonStyles
} from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/styles/common.style";
import {AppRoutes, ExternalRoutes} from "../../../../../utils/navigation";
import CustomButton from "../../../../common/CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, WHITE} from "../../../../../utils/colors";

const BroadbandTestingIcon = "/assets/images/floating-toolkit-broadband-testing-icon.png";
const MappingToolsIcon = "/assets/images/floating-toolkit-map-icon.png";
const SiteMonitoringIcon = "/assets/images/floating-toolkit-site-monitoring-icon.png";
const RedirectArrowGray = '/assets/images/redirect-arrow-gray.png';
const RightChevron = '/assets/images/chevron-right-white.png';

const SmallNavbarContentOpen = (): ReactElement => {
  return (
    <div style={styles.SmallNavbarContentOpen}>
      <div style={styles.TabsContainer}>
        <a className={'fw-bold hover-opaque'}
           href={AppRoutes.HOME}
           style={styles.Link}>
          Overview
        </a>
        <NavbarHorizontalDivider/>
        <p className={'fw-bold hover-opaque'} style={styles.LinkText}>Our Toolkit</p>
        <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                              title={ToolkitTabContentRowTitle.SITE_MONITORING}
                              link={AppRoutes.SITE_MONITORING}
                              isFirst
        />
        <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                              title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                              link={AppRoutes.BROADBAND_TESTING}
        />
        <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>}
                              title={ToolkitTabContentRowTitle.MAPPING_TOOLS}
                              link={process.env.NODE_ENV === 'production' ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING}
                              openNewTab
                              extraIcon={<img src={RedirectArrowGray} style={commonStyles.RedirectIcon} alt={'new-tab-icon'}/>}

        />
        <NavbarHorizontalDivider/>
        <CustomButton text={'Get started'}
                      link={AppRoutes.GET_STARTED}
                      backgroundColor={DEFAULT_PRIMARY_BUTTON}
                      color={WHITE}
                      icon={<img src={RightChevron} style={styles.Icon} alt={'white right chevron'}/>}
        />
      </div>
    </div>
  )
}

export default SmallNavbarContentOpen;