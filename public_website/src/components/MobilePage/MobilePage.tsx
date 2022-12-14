import {ReactElement, useEffect} from "react";
import {styles} from "./styles/MobilePage.style";
import MobilePageHeader from "./MobilePageHeader/MobilePageHeader";
import MobilePageCarrousel from "./MobilePageCarrousel/MobilePageCarrousel";
import MobilePageDownload from "./MobilePageDownload/MobilePageDownload";
import RadarRedirect from "../common/RadarRedirect/RadarRedirect";

const MobilePage = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Broadband Speed Test for Mobile Devices';
  }, []);

  return (
    <div style={styles.MobilePage}>
      <div style={styles.MobilePageContent}>
        <MobilePageHeader/>
        <MobilePageCarrousel/>
        <MobilePageDownload/>
        <RadarRedirect/>
      </div>
    </div>
  );
}

export default MobilePage;