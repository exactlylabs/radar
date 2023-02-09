import React, {ReactElement, useEffect, useState} from "react";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import Head from "next/head";
import Frame from "../src/components/Frame/Frame";
import {styles} from '../src/components/GetStartedPage/styles/GetStartedPage.style';
import GetStartedForm from "../src/components/GetStartedPage/GetStartedForm/GetStartedForm";
import GetStartedEmailSent from "../src/components/GetStartedPage/GetStartedEmailSent/GetStartedEmailSent";
import ToolkitRedirectionSection from "../src/components/HomePage/ToolkitRedirectionSection/ToolkitRedirectionSection";

const GetStarted = (): ReactElement => {

  const [hasSentEmail, setHasSentEmail] = useState(false);

  useEffect(() => {
    if(window) setHasSentEmail(window.location.href.includes('test'));
  }, []);

  const handleSubmit = () => setHasSentEmail(true);

  return (
    <ViewportContextProvider>
      <>
        <Head>
          <title>Radar - Get Started with Radar Toolkit</title>
          <meta name={'description'} content={'Start using our broadband monitoring and speed testing tools in no time.'}/>
        </Head>
        <Frame isDifferentColorFooter
               footerMargin={hasSentEmail ? '280px auto 0' : '40px auto 0'}
               footerHeight={hasSentEmail ? '440px' : '200px'}
               smallFooterMarginTop={hasSentEmail ? '-160px' : '40px'}
        >
          <div style={styles.GetStartedPage(hasSentEmail)}>
            { !hasSentEmail ?
              <GetStartedForm onSubmit={handleSubmit}/> :
              <GetStartedEmailSent/>
            }
            {hasSentEmail && <ToolkitRedirectionSection />}
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  )
}

export default GetStarted;