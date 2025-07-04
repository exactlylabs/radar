import {ReactElement} from "react";
import {styles} from "./styles/MobilePageDownload.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import StoreLinks from "../StoreLinks/StoreLinks";

const MobilePageDownload = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.MobilePageDownload(isSmall)}>
      <div style={styles.ComingSoonPill}>
        <p className={'fw-extra-bold'} style={styles.ComingSoonPillText}>COMING SOON</p>
      </div>
    
      <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Download Radar for free.</p>
      <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Radar is available for iOS and Android and is totally free to use. Download our app and ensure you’re getting what you’re expecting from your internet provider.</p>
      <div style={styles.StoreLinksContainer}>
        <StoreLinks/>
      </div>
    </div>
  );
}

export default MobilePageDownload;