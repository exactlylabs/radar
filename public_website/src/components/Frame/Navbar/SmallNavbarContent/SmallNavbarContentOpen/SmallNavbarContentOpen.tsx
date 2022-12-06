import {ReactElement} from "react";
import {styles} from "./styles/SmallNavbarContentOpen.style";
import NavbarHorizontalDivider from "./NavbarHorizontalDivider/NavbarHorizontalDivider";
import ToolkitTabContentRow
  from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/ToolkitTabContentRow/ToolkitTabContentRow";
import {ToolkitTabContentRowTitle} from "../../RegularNavbarContent/ToolkitFloatingMenu/types";
import SiteMonitoringIcon from "../../../../../assets/images/site-monitoring-icon.png";
import {
  commonStyles
} from "../../RegularNavbarContent/ToolkitFloatingMenu/RightSideToolkitTabContent/styles/common.style";
import BroadbandTestingIcon from "../../../../../assets/images/broadband-testing-icon.png";
import MappingToolsIcon from "../../../../../assets/images/mapping-tools-icon.png";


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
        <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>} title={ToolkitTabContentRowTitle.SITE_MONITORING}/>
        <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>} title={ToolkitTabContentRowTitle.BROADBAND_TESTING}/>
        <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>} title={ToolkitTabContentRowTitle.MAPPING_TOOLS}/>
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