import {ReactElement, useState} from "react";
import {styles} from "./styles/Frame.style";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import SmallScreenFrame from "./SmallScreenFrame";
import DesktopScreenFrame from "./DesktopScreenFrame";
import {isIphoneAndSafari} from "../../utils/iphone";

interface FrameProps {
  children: ReactElement,
  centerOnUser: (center: Array<number>) => void;
}

const Frame = ({children, centerOnUser}: FrameProps): ReactElement => {

  const {isSmallScreen, isTabletScreen} = useViewportSizes();
  const hasSmallFrame = isSmallScreen || isTabletScreen;

  const [wantsToProceed, setWantsToProceed] = useState(false);

  return (
    <div style={styles.FrameWrapper(hasSmallFrame, isIphoneAndSafari())} id={'main-frame'}>
      { hasSmallFrame && !wantsToProceed ?
        <SmallScreenFrame centerOnUser={centerOnUser} setWantsToProceed={setWantsToProceed}>{children}</SmallScreenFrame> :
        <DesktopScreenFrame centerOnUser={centerOnUser}>{children}</DesktopScreenFrame>
      }
    </div>
  )
}

export default Frame;