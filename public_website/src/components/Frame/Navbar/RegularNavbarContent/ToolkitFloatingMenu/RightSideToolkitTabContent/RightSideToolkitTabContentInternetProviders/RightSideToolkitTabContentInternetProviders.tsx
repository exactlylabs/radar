import {ReactElement} from "react";
import ToolkitTabContentRow from "../ToolkitTabContentRow/ToolkitTabContentRow";
import {commonStyles} from "../styles/common.style";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {goToBroadbandTesting, goToMappingApp, goToSiteMonitoring} from "../../../../../../../utils/navigation";

const SiteMonitoringIcon = "/assets/images/site-monitoring-icon.png";
const BroadbandTestingIcon = "/assets/images/broadband-testing-icon.png";
const MappingToolsIcon = "/assets/images/mapping-tools-icon.png";
const RedirectArrowGray = '/assets/images/redirect-arrow-gray.png';

const RightSideToolkitTabContentInternetProviders = (): ReactElement => {
  return (
    <div>
      <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                            title={ToolkitTabContentRowTitle.SITE_MONITORING}
                            subtitle={ToolkitTabContentRowSubtitle.INTERNET_PROVIDERS_SITE_MONITORING}
                            onClick={goToSiteMonitoring}
                            isFirst
      />
      <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                            title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                            subtitle={ToolkitTabContentRowSubtitle.INTERNET_PROVIDERS_BROADBAND_TESTING}
                            onClick={goToBroadbandTesting}
      />
      <ToolkitTabContentRow icon={<img src={MappingToolsIcon} style={commonStyles.Icon} alt={'mapping-tools-icon'}/>}
                            title={ToolkitTabContentRowTitle.MAPPING_TOOLS}
                            subtitle={ToolkitTabContentRowSubtitle.INTERNET_PROVIDERS_MAPPING_TOOLS}
                            onClick={goToMappingApp}
                            extraIcon={<img src={RedirectArrowGray} style={commonStyles.RedirectIcon} alt={'new-tab-icon'}/>}
      />
    </div>
  )
}

export default RightSideToolkitTabContentInternetProviders;