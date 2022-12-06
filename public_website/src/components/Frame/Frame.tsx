import {ReactElement} from "react";
import {styles} from "./styles/Frame.style";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

interface FrameProps {
  children: ReactElement;
}

const Frame = ({ children }: FrameProps): ReactElement => {
  return (
    <div style={styles.Frame}>
      <Navbar/>
      <div>
        {children}
      </div>
      <Footer/>
    </div>
  )
}

export default Frame;