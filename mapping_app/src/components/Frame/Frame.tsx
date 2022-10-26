import {ReactElement, useState} from "react";
import TopLevelTabsHeader from "./TopLevelTabsHeader";
import SecondLevelContentHeader from "./SecondLevelContentHeader";
import TopLevelFooter from "./TopLevelFooter";
import SecondLevelFooter from "./SecondLevelFooter";
import {styles} from "./styles/Frame.style";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import SmallScreenNotice from "../SmallScreenNoticePage/SmallScreenNotice";

interface FrameProps {
  children: ReactElement,
  centerOnUser: (center: Array<number>) => void;
}

const Frame = ({children, centerOnUser}: FrameProps): ReactElement => {

  const {isSmallSizeScreen} = useViewportSizes();

  const [wantsToProceed, setWantsToProceed] = useState(false);

  return (
    <div style={styles.FrameWrapper} id={'main-frame'}>
      { (!isSmallSizeScreen || wantsToProceed) && <TopLevelTabsHeader centerOnUser={centerOnUser}/> }
      { (!isSmallSizeScreen || wantsToProceed) && <SecondLevelContentHeader/> }
      { (!isSmallSizeScreen || wantsToProceed) &&
        <div style={styles.ContentWrapper}>
          {children}
        </div>
      }
      { (!isSmallSizeScreen || wantsToProceed) && <TopLevelFooter/> }
      { (!isSmallSizeScreen || wantsToProceed) && <SecondLevelFooter/> }
      { isSmallSizeScreen && !wantsToProceed && <SmallScreenNotice setWantsToProceed={setWantsToProceed}/> }
    </div>
  )
}

export default Frame;