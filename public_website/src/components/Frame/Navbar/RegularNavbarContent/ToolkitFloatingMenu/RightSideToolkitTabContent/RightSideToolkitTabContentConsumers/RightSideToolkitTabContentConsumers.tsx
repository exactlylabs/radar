import {ReactElement} from "react";
import ToolkitTabContentRow from "../ToolkitTabContentRow/ToolkitTabContentRow";
import {commonStyles} from "../styles/common.style";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {goToBroadbandTesting, goToSiteMonitoring} from "../../../../../../../utils/navigation";

const SiteMonitoringIcon = "/assets/images/site-monitoring-icon.png";
const BroadbandTestingIcon = "/assets/images/broadband-testing-icon.png";

const RightSideToolkitTabContentConsumers = (): ReactElement => {
  return (
    <div>
      <ToolkitTabContentRow icon={<img src={BroadbandTestingIcon} style={commonStyles.Icon} alt={'broadband-testing-icon'}/>}
                            title={ToolkitTabContentRowTitle.BROADBAND_TESTING}
                            subtitle={ToolkitTabContentRowSubtitle.CONSUMERS_BROADBAND_TESTING}
                            onClick={goToBroadbandTesting}
      />
      <ToolkitTabContentRow icon={<img src={SiteMonitoringIcon} style={commonStyles.Icon} alt={'site-monitoring-icon'}/>}
                            title={ToolkitTabContentRowTitle.SITE_MONITORING}
                            subtitle={ToolkitTabContentRowSubtitle.CONSUMERS_SITE_MONITORING}
                            onClick={goToSiteMonitoring}
      />
    </div>
  )
}

export default RightSideToolkitTabContentConsumers;