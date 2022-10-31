import {ReactElement, useState} from "react";
import {styles} from "./styles/Frame.style";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import SmallScreenFrame from "./SmallScreenFrame";
import DesktopScreenFrame from "./DesktopScreenFrame";

interface FrameProps {
  children: ReactElement,
  centerOnUser: (center: Array<number>) => void;
}

const Frame = ({children, centerOnUser}: FrameProps): ReactElement => {

  const {isSmallerThanMid} = useViewportSizes();

  const [wantsToProceed, setWantsToProceed] = useState(false);

  return (
    <div style={styles.FrameWrapper(isSmallerThanMid)} id={'main-frame'}>
      { isSmallerThanMid && !wantsToProceed ?
        <SmallScreenFrame centerOnUser={centerOnUser} setWantsToProceed={setWantsToProceed}>{children}</SmallScreenFrame> :
        <DesktopScreenFrame centerOnUser={centerOnUser}>{children}</DesktopScreenFrame>
      }
    </div>
  )
}

export default Frame;