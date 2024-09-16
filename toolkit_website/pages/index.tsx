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
          <title>Radar: Internet Speed Test & Broadband Monitoring Tools</title>
          <meta name="description" content="Radar is a community toolkit to test Internet speed, monitor and analyze broadband and get insights into where internet investments should be made."/>
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