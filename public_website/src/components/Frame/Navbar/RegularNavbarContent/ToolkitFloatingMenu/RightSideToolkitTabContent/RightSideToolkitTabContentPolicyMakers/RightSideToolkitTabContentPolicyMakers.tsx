import {ReactElement} from "react";
import ToolkitTabContentRow from "../ToolkitTabContentRow/ToolkitTabContentRow";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {commonStyles} from "../styles/common.style";
import {goToBroadbandTesting, goToMappingApp, goToSiteMonitoring} from "../../../../../../../utils/navigation";

const SiteMonitoringIcon = '/assets/images/site-monitoring-icon.png';
const BroadbandTestingIcon = '/assets/images/broadband-testing-icon.png';
const MappingToolsIcon = '/assets/images/mapping-tools-icon.png';

const RightSideToolkitTabContentPolicyMakers = (): ReactElement => {
  return (
    <div>
      <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                            title={ToolkitTabContentRowTitle.SITE_MONITORING}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_SITE_MONITORING}
                            onClick={goToSiteMonitoring}
      />
      <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                            title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_BROADBAND_TESTING}
                            onClick={goToBroadbandTesting}
      />
      <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>}
                            title={ToolkitTabContentRowTitle.MAPPING_TOOLS}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_MAPPING_TOOLS}
                            onClick={goToMappingApp}
      />
    </div>
  )
}

export default RightSideToolkitTabContentPolicyMakers;