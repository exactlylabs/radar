import {ReactElement} from "react";
import {styles} from "./styles/Frame.style";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

interface FrameProps {
  children: ReactElement;
  isDifferentColorFooter?: boolean;
  footerMargin?: string;
  smallFooterMarginTop?: string;
}

const Frame = ({ children, isDifferentColorFooter,  footerMargin, smallFooterMarginTop }: FrameProps): ReactElement => {
  return (
    <div style={styles.Frame}>
      <Navbar/>
      <div style={styles.Children(footerMargin)}>
        {children}
      </div>
      <Footer isDifferentColor={isDifferentColorFooter}
              margin={footerMargin}
              smallFooterMarginTop={smallFooterMarginTop}
      />
    </div>
  )
}

export default Frame;