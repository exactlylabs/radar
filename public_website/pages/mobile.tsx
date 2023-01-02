import {ReactElement, useEffect} from "react";
import {styles} from "../src/components/MobilePage/styles/MobilePage.style";
import MobilePageHeader from "../src/components/MobilePage/MobilePageHeader/MobilePageHeader";
import MobilePageCarrousel from "../src/components/MobilePage/MobilePageCarrousel/MobilePageCarrousel";
import MobilePageDownload from "../src/components/MobilePage/MobilePageDownload/MobilePageDownload";
import RadarRedirect from "../src/components/common/RadarRedirect/RadarRedirect";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Frame from "../src/components/Frame/Frame";

const Mobile = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Broadband Speed Test for Mobile Devices';
  }, []);

  return (
    <ViewportContextProvider>
      <Frame>
        <div style={styles.MobilePage}>
          <div style={styles.MobilePageContent}>
            <MobilePageHeader/>
            <MobilePageCarrousel/>
            <MobilePageDownload/>
            <RadarRedirect/>
          </div>
        </div>
      </Frame>
    </ViewportContextProvider>
  );
}

export default Mobile;