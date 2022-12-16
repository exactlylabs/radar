import {ReactElement} from "react";
import ToolkitTabContentRow from "../ToolkitTabContentRow/ToolkitTabContentRow";
import SiteMonitoringIcon from "../../../../../../../assets/images/site-monitoring-icon.png";
import {commonStyles} from "../styles/common.style";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import BroadbandTestingIcon from "../../../../../../../assets/images/broadband-testing-icon.png";
import MappingToolsIcon from "../../../../../../../assets/images/mapping-tools-icon.png";
import {goToBroadbandTesting, goToMappingApp, goToSiteMonitoring} from "../../../../../../../utils/navigation";


const RightSideToolkitTabContentInternetProviders = (): ReactElement => {
  return (
    <div>
      <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                            title={ToolkitTabContentRowTitle.SITE_MONITORING}
                            subtitle={ToolkitTabContentRowSubtitle.INTERNET_PROVIDERS_SITE_MONITORING}
                            onClick={goToSiteMonitoring}
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
      />
    </div>
  )
}

export default RightSideToolkitTabContentInternetProviders;