import React, {ReactElement} from "react";
import {styles} from "../src/components/HomePage/styles/HomePage.style";
import ToolkitIntroductionSection from "../src/components/HomePage/ToolkitIntroductionSection/ToolkitIntroductionSection";
import InternetInvestmentSection from "../src/components/HomePage/InternetInvestmentSection/InternetInvestmentSection";
import ToolkitDetailSection from "../src/components/HomePage/ToolkitDetailSection/ToolkitDetailSection";
import ToolkitRedirectionSection from "../src/components/HomePage/ToolkitRedirectionSection/ToolkitRedirectionSection";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Head from "next/head";

const Index = (): ReactElement => {
  return (
    <ViewportContextProvider>
      <>
        <Head>
          <title>Radar - Internet Speed Test and Monitoring for Better Broadband Investments</title>
          <meta name="description" content="Radar helps identify where Internet investment will go the furthest by providing insights into broadband as it is today in your community."/>
          <meta property="og:title" content="Radar - Internet Speed Test and Monitoring for Better Broadband Investments" />
          <meta property="og:description" content="Radar helps identify where Internet investment will go the furthest by providing insights into broadband as it is today in your community." />
          <meta property="og:image" content="./og.png" />
          
        </Head>
        <Frame smallFooterMarginTop={'0px'}>
          <div style={styles.HomePage}>
            <ToolkitIntroductionSection />
            <InternetInvestmentSection />
            <ToolkitDetailSection />
            <ToolkitRedirectionSection />
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  )
}

export default Index;