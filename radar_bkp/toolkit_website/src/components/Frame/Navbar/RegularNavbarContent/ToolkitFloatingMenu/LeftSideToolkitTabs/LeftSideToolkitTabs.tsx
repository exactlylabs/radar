import {ReactElement} from "react";
import {ToolkitTab, ToolkitTabSubtitle, ToolkitTabTitle} from "../types";
import ToolkitTabOption from "./ToolkitTabOption/ToolkitTabOption";
import {styles} from "./styles/LeftSideToolkitTabs.style";

interface LeftSideToolkitTabsProps {
  selectedTab: ToolkitTab;
  setSelectedTab: (tab: ToolkitTab) => void;
}

const LeftSideToolkitTabs = ({
  selectedTab,
  setSelectedTab
}: LeftSideToolkitTabsProps): ReactElement => {

  const selectPolicyMakers = () => setSelectedTab(ToolkitTab.POLICY_MAKERS);
  const selectConsumers = () => setSelectedTab(ToolkitTab.CONSUMERS);
  const selectInternetProviders = () => setSelectedTab(ToolkitTab.INTERNET_PROVIDERS);

  return (
    <div style={styles.LeftSideToolkitTabs}>
      <ToolkitTabOption title={ToolkitTabTitle.POLICY_MAKERS}
                        subtitle={ToolkitTabSubtitle.POLICY_MAKERS}
                        selected={selectedTab === ToolkitTab.POLICY_MAKERS}
                        onHover={selectPolicyMakers}
      />
      <ToolkitTabOption title={ToolkitTabTitle.CONSUMERS}
                        subtitle={ToolkitTabSubtitle.CONSUMERS}
                        selected={selectedTab === ToolkitTab.CONSUMERS}
                        onHover={selectConsumers}
      />
      <ToolkitTabOption title={ToolkitTabTitle.INTERNET_PROVIDERS}
                        subtitle={ToolkitTabSubtitle.INTERNET_PROVIDERS}
                        selected={selectedTab === ToolkitTab.INTERNET_PROVIDERS}
                        onHover={selectInternetProviders}
      />
    </div>
  )
}

export default LeftSideToolkitTabs;