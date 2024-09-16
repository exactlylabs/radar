import React, {ReactElement} from "react";
import {styles} from "../src/components/BroadbandTestingPage/styles/BroadbandTestingPage.style";
import RadarRedirect from "../src/components/common/RadarRedirect/RadarRedirect";
import BroadbandTestingMobile from "../src/components/BroadbandTestingPage/BroadbandTestingMobile/BroadbandTestingMobile";
import BroadbandTestingSpeedtest from "../src/components/BroadbandTestingPage/BroadbandTestingSpeedtest/BroadbandTestingSpeedtest";
import BroadbandTestingCommunity from "../src/components/BroadbandTestingPage/BroadbandTestingCommunity/BroadbandTestingCommunity";
import BroadbandTestingHeader from "../src/components/BroadbandTestingPage/BroadbandTestingHeader/BroadbandTestingHeader";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Head from "next/head";

const BroadbandTesting = (): ReactElement => {
  return (
    <ViewportContextProvider>
      <>
        <Head>
          <title>Radar: Internet Speed Test for Communities</title>
          <meta name="description" content="Test your community's broadband using our Internet speed test tool to determine where investments will be most impactful."/>
        </Head>
        <Frame isDifferentColorFooter>
          <div style={styles.BroadbandTestingPage}>
            <BroadbandTestingHeader />
            <BroadbandTestingCommunity />
            <BroadbandTestingSpeedtest />
            <BroadbandTestingMobile />
            <RadarRedirect marginTop={'-90px'}/>
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  );
}

export default BroadbandTesting;