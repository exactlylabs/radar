import {ReactElement} from "react";
import {WHITE} from "../../styles/colors";
import {styles} from "./styles/CustomOverlayingLoader.style";
import CustomSpinner from "./CustomSpinner";

const CustomOverlayingLoader = (): ReactElement => {
  return (
    <div style={styles.OverlayingLoaderContainer}>
      <div style={styles.ContentContainer}>
        <CustomSpinner color={WHITE} style={styles.Spinner}/>
        <p className={'fw-light'} style={styles.Text}>Loading map...</p>
      </div>
    </div>
  )
}

export default CustomOverlayingLoader;