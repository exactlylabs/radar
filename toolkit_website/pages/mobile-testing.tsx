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
          <title>Radar - Broadband Speed Test for Mobile Devices</title>
          <meta name="description" content="Test your wifi or cellular connection to find out if you're getting what you expect from your Internet provider."/>
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