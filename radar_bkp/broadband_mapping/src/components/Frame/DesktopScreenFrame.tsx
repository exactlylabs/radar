import {ReactElement} from "react";
import TopLevelTabsHeader from "./TopLevelTabsHeader";
import SecondLevelContentHeader from "./SecondLevelContentHeader";
import {styles} from "./styles/Frame.style";
import TopLevelFooter from "./TopLevelFooter";
import SecondLevelFooter from "./SecondLevelFooter";

interface DesktopScreenFrameProps {
  children: ReactElement,
  centerOnUser: (center: Array<number>) => void;
}

const DesktopScreenFrame = ({
  children,
  centerOnUser
}: DesktopScreenFrameProps): ReactElement => {
  return (
    <>
      <TopLevelTabsHeader centerOnUser={centerOnUser}/>
      <SecondLevelContentHeader/>
      <div style={styles.ContentWrapper}>
        {children}
      </div>
      <TopLevelFooter/>
      <SecondLevelFooter/>
    </>
  );
}

export default DesktopScreenFrame;