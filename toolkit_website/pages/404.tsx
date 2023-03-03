import React, {ReactElement} from "react";
import Head from "next/head";
import Frame from "../src/components/Frame/Frame";
import {styles} from '../src/components/NotFoundPage/styles/404Page.style';
import {ViewportContextProvider} from "../src/context/ViewportContent";
import ToolkitRedirectionSection from "../src/components/HomePage/ToolkitRedirectionSection/ToolkitRedirectionSection";
import NotFoundPageHeader from "../src/components/NotFoundPage/NotFoundPageHeader/NotFoundPageHeader";

const NotFound = (): ReactElement => {
  return (
    <ViewportContextProvider>
      <>
        <Head>
          <title>Radar - Page not found</title>
          <meta name="description" content="Radar helps identify where Internet investment will go the furthest by providing insights into broadband as it is today in your community."/>
        </Head>
        <Frame isDifferentColorFooter>
          <div style={styles.NotFoundPage}>
            <NotFoundPageHeader />
            <ToolkitRedirectionSection />
          </div>
        </Frame>
      </>
    </ViewportContextProvider>
  )
}

export default NotFound;