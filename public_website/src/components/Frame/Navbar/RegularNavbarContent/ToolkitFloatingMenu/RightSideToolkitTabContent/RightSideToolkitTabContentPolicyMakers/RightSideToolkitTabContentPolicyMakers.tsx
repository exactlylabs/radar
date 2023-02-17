import {ReactElement} from "react";
import ToolkitTabContentRow from "../ToolkitTabContentRow/ToolkitTabContentRow";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {commonStyles} from "../styles/common.style";
import {AppRoutes, ExternalRoutes, isProduction} from "../../../../../../../utils/navigation";

const SiteMonitoringIcon = '/assets/images/floating-toolkit-site-monitoring-icon.png';
const BroadbandTestingIcon = '/assets/images/floating-toolkit-broadband-testing-icon.png';
const MappingToolsIcon = '/assets/images/floating-toolkit-map-icon.png';
const RedirectArrowGray = '/assets/images/redirect-arrow-gray.png';

const RightSideToolkitTabContentPolicyMakers = (): ReactElement => {
  return (
    <div>
      <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                            title={ToolkitTabContentRowTitle.SITE_MONITORING}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_SITE_MONITORING}
                            isFirst
                            link={AppRoutes.SITE_MONITORING}
      />
      <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                            title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_BROADBAND_TESTING}
                            link={AppRoutes.BROADBAND_TESTING}
      />
      <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>}
                            title={ToolkitTabContentRowTitle.MAPPING_TOOLS}
                            subtitle={ToolkitTabContentRowSubtitle.POLICY_MAKERS_MAPPING_TOOLS}
                            extraIcon={<img src={RedirectArrowGray} style={commonStyles.RedirectIcon} alt={'new-tab-icon'}/>}
                            link={isProduction ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING}
                            openNewTab
      />
    </div>
  )
}

export default RightSideToolkitTabContentPolicyMakers;