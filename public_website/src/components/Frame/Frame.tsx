import {ReactElement} from "react";
import {styles} from "./styles/Frame.style";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

interface FrameProps {
  children: ReactElement;
  isDifferentColorFooter?: boolean;
  footerHeight?: string;
  footerMargin?: string;
}

const Frame = ({ children, isDifferentColorFooter, footerHeight,  footerMargin }: FrameProps): ReactElement => {
  return (
    <div style={styles.Frame}>
      <Navbar/>
      <div style={styles.Children(footerMargin)}>
        {children}
      </div>
      <Footer isDifferentColor={isDifferentColorFooter} height={footerHeight} margin={footerMargin}/>
    </div>
  )
}

export default Frame;