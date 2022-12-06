import {ReactElement} from "react";
import {ToolkitTab} from "../types";
import RightSideToolkitTabContentInternetProviders
  from "./RightSideToolkitTabContentInternetProviders/RightSideToolkitTabContentInternetProviders";
import RightSideToolkitTabContentConsumers
  from "./RightSideToolkitTabContentConsumers/RightSideToolkitTabContentConsumers";
import RightSideToolkitTabContentPolicyMakers
  from "./RightSideToolkitTabContentPolicyMakers/RightSideToolkitTabContentPolicyMakers";

interface RightSideToolkitTabContentProps {
  selectedTab: ToolkitTab;
}

const RightSideToolkitTabContent = ({
  selectedTab
}: RightSideToolkitTabContentProps): ReactElement => {

  const getTabContent = (): ReactElement => {
    switch (selectedTab) {
      case ToolkitTab.INTERNET_PROVIDERS:
        return <RightSideToolkitTabContentInternetProviders />
      case ToolkitTab.CONSUMERS:
        return <RightSideToolkitTabContentConsumers />
      default:
        return <RightSideToolkitTabContentPolicyMakers />;
    }
  }

  return getTabContent();
}

export default RightSideToolkitTabContent;