import {ReactElement} from "react";
import {styles} from "./styles/SmallNavbarContentOpen.style";
import NavbarHorizontalDivider from "./NavbarHorizontalDivider/NavbarHorizontalDivider";
import ToolkitTabContentRow
  from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/ToolkitTabContentRow/ToolkitTabContentRow";
import {ToolkitTabContentRowTitle} from "../../RegularNavbarContent/ToolkitFloatingMenu/types";
import {
  commonStyles
} from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/styles/common.style";

const BroadbandTestingIcon = "/assets/images/broadband-testing-icon.png";
const MappingToolsIcon = "/assets/images/mapping-tools-icon.png";
const SiteMonitoringIcon = "/assets/images/site-monitoring-icon.png";

import {goToBroadbandTesting, goToMappingApp, goToSiteMonitoring} from "../../../../../utils/navigation";


const SmallNavbarContentOpen = (): ReactElement => {
  return (
    <div style={styles.SmallNavbarContentOpen}>
      <div style={styles.TabsContainer}>
        <a className={'fw-bold hover-opaque'}
           href={'/overview'}
           style={styles.Link}>
          Overview
        </a>
        <NavbarHorizontalDivider/>
        <a className={'fw-bold hover-opaque'}
           href={'/toolkit'}
           style={styles.Link}>
          Our Toolkit
        </a>
        <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                              title={ToolkitTabContentRowTitle.SITE_MONITORING}
                              onClick={goToSiteMonitoring}
        />
        <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                              title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                              onClick={goToBroadbandTesting}
        />
        <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>}
                              title={ToolkitTabContentRowTitle.MAPPING_TOOLS}
                              onClick={goToMappingApp}
        />
        <NavbarHorizontalDivider/>
        <a className={'fw-bold hover-opaque'}
           href={'mailto:contact@exactlylabs.com'}
           style={styles.Link}>
          Contact Us
        </a>
      </div>
    </div>
  )
}

export default SmallNavbarContentOpen;