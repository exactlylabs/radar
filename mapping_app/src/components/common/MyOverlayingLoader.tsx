import {ReactElement} from "react";
import MySpinner from "./MySpinner";
import {DEFAULT_GREEN} from "../../styles/colors";
import {styles} from "./styles/MyOverlayingLoader.style";

const MyOverlayingLoader = (): ReactElement => {
  return (
    <div style={styles.OverlayingLoaderContainer}>
      <MySpinner color={DEFAULT_GREEN} style={{width: '50px'}}/>
    </div>
  )
}

export default MyOverlayingLoader;