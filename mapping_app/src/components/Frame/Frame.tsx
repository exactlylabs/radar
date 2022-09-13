import {ReactElement} from "react";
import TopLevelTabsHeader from "./TopLevelTabsHeader";
import SecondLevelContentHeader from "./SecondLevelContentHeader";
import TopLevelFooter from "./TopLevelFooter";
import SecondLevelFooter from "./SecondLevelFooter";
import {styles} from "./styles/Frame.style";

interface FrameProps {
  children: ReactElement,
}

const Frame = ({children}: FrameProps): ReactElement => {

  return (
    <div style={styles.FrameWrapper()}>
      <TopLevelTabsHeader/>
      <SecondLevelContentHeader/>
      <div style={styles.ContentWrapper()}>
        {children}
      </div>
      <TopLevelFooter/>
      <SecondLevelFooter/>
    </div>
  )
}

export default Frame;