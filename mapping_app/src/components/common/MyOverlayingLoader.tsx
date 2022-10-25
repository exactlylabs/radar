import {ReactElement} from "react";
import MySpinner from "./MySpinner";
import {WHITE} from "../../styles/colors";
import {styles} from "./styles/MyOverlayingLoader.style";

const MyOverlayingLoader = (): ReactElement => {
  return (
    <div style={styles.OverlayingLoaderContainer}>
      <div style={styles.ContentContainer}>
        <MySpinner color={WHITE} style={styles.Spinner}/>
        <p className={'fw-light'} style={styles.Text}>Loading map...</p>
      </div>
    </div>
  )
}

export default MyOverlayingLoader;