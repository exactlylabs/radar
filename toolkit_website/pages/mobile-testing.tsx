import React, {ReactElement} from "react";
import {styles} from "../src/components/MobilePage/styles/MobilePage.style";
import MobilePageHeader from "../src/components/MobilePage/MobilePageHeader/MobilePageHeader";
import MobilePageCarrousel from "../src/components/MobilePage/MobilePageCarrousel/MobilePageCarrousel";
import MobilePageDownload from "../src/components/MobilePage/MobilePageDownload/MobilePageDownload";
import RadarRedirect from "../src/components/common/RadarRedirect/RadarRedirect";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Frame from "../src/components/Frame/Frame";
import Head from "next/head";

const MobileTesting = (): ReactElement => {
  return (
    <ViewportContextProvider>
      <>
        <Head>
          <title>Radar: Mobile App to Test Wifi and Cellular Quality</title>
          <meta name="description" content="Monitor the quality of wifi and cellular signal. Gain a deeper understanding of where internet is not available in your community quickly."/>
        </Head>
        <Frame isDifferentColorFooter >
          <div style={styles.MobilePage}>
            <MobilePageHeader/>
            <MobilePageCarrousel/>
            <MobilePageDownload/>
            <RadarRedirect marginTop={'-90px'}/>
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  );
}

export default MobileTesting;