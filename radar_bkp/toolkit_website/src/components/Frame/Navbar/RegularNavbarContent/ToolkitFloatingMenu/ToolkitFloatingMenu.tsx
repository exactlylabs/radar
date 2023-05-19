import {ReactElement, useState} from "react";
import {styles} from "./styles/ToolkitFloatingMenu.style";
import LeftSideToolkitTabs from "./LeftSideToolkitTabs/LeftSideToolkitTabs";
import RightSideToolkitTabContent from "./RightSideToolkitTabContent/RightSideToolkitTabContent";
import {ToolkitTab} from "./types";
import { useIsTouchDevice } from "../../../../../hooks/useIsTouchDevice";

interface ToolkitFloatingMenuProps {
  setIsOpen: (value: boolean) => void;
}

const ToolkitFloatingMenu = ({
  setIsOpen
}: ToolkitFloatingMenuProps): ReactElement => {

  const isTouchDevice = useIsTouchDevice().current;
  const [selectedTab, setSelectedTab] = useState<ToolkitTab>(ToolkitTab.POLICY_MAKERS);

  const keepOpen = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  return (
    <div style={styles.ToolkitFloatingMenu}
         onMouseOver={isTouchDevice ? undefined : keepOpen}
         onMouseLeave={isTouchDevice ? undefined : closeMenu}
         id={'toolkit-floating-menu--container'}
    >
      <div style={styles.Square}></div>
      <LeftSideToolkitTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
      <RightSideToolkitTabContent selectedTab={selectedTab}/>
    </div>
  )
}

export default ToolkitFloatingMenu;