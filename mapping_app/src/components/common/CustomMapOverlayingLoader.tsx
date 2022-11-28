import {ReactElement} from "react";
import CustomSpinner from "./CustomSpinner";
import {WHITE} from "../../styles/colors";
import {styles} from "./styles/CustomMapOverlayingLoader.style";

const CustomMapOverlayingLoader = (): ReactElement => {
  return (
    <div style={styles.OverlayingLoaderContainer}>
      <div style={styles.ContentContainer}>
        <CustomSpinner color={WHITE} style={styles.Spinner}/>
        <p className={'fw-light'} style={styles.Text}>Loading map...</p>
      </div>
    </div>
  )
}

export default CustomMapOverlayingLoader;