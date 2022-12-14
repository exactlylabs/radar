import {ReactElement} from "react";
import {styles} from "./styles/MobilePageDownload.style";


const MobilePageDownload = (): ReactElement => (
  <div style={styles.MobilePageDownload}>
    <p className={'fw-bold'} style={styles.Header}>Get the app</p>
    <p className={'fw-extra-bold'} style={styles.Title}>Download Radar for free.</p>
    <p className={'fw-medium'} style={styles.Subtitle}>Radar is available for iOS and Android and is totally free to use. Download our app and ensure you’re getting what you’re expecting from your internet provider.</p>
  </div>
);

export default MobilePageDownload;