import React, {ReactElement} from "react";
import {styles} from "../src/components/SiteMonitoringPage/styles/SiteMonitoringPage.style";
import SiteMonitoringHeader from "../src/components/SiteMonitoringPage/SiteMonitoringHeader/SiteMonitoringHeader";
import SiteMonitoringNetworkIssues from "../src/components/SiteMonitoringPage/SiteMonitoringNetworkIssues/SiteMonitoringNetworkIssues";
import SiteMonitoringBulletpoints from "../src/components/SiteMonitoringPage/SiteMonitoringBulletpoints/SiteMonitoringBulletpoints";
import RadarRedirect from "../src/components/common/RadarRedirect/RadarRedirect";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Head from "next/head";


const SiteMonitoringPage = (): ReactElement => {
  return (
    <ViewportContextProvider>
      <>
      <Head>
          <title>Radar - Remote Monitoring of your Sites' Internet Connectivity</title>
          <meta name="description" content="Ensure sites' Internet connectivity quality matches your expectations through continuous remote monitoring."/>
        </Head>
        <Frame isDifferentColorFooter>
          <div style={styles.SiteMonitoringPage}>
            <SiteMonitoringHeader/>
            <SiteMonitoringNetworkIssues />
            <SiteMonitoringBulletpoints />
            <RadarRedirect />
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  );
}

export default SiteMonitoringPage;