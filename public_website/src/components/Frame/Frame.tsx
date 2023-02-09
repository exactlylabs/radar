import {ReactElement} from "react";
import {styles} from "./styles/Frame.style";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import {useViewportSizes} from "../../hooks/useViewportSizes";

interface FrameProps {
  children: ReactElement;
  isDifferentColorFooter?: boolean;
  footerHeight?: string;
  footerMargin?: string;
  smallFooterMarginTop?: string;
}

const Frame = ({ children, isDifferentColorFooter, footerHeight,  footerMargin, smallFooterMarginTop }: FrameProps): ReactElement => {
  return (
    <div style={styles.Frame}>
      <Navbar/>
      <div style={styles.Children(footerMargin)}>
        {children}
      </div>
      <Footer isDifferentColor={isDifferentColorFooter}
              height={footerHeight}
              margin={footerMargin}
              smallFooterMarginTop={smallFooterMarginTop}
      />
    </div>
  )
}

export default Frame;