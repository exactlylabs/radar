import {ReactElement, useEffect} from "react";
import {styles} from "../src/components/BroadbandTestingPage/styles/BroadbandTestingPage.style";
import RadarRedirect from "../src/components/common/RadarRedirect/RadarRedirect";
import BroadbandTestingMobile from "../src/components/BroadbandTestingPage/BroadbandTestingMobile/BroadbandTestingMobile";
import BroadbandTestingSpeedtest from "../src/components/BroadbandTestingPage/BroadbandTestingSpeedtest/BroadbandTestingSpeedtest";
import BroadbandTestingCommunity from "../src/components/BroadbandTestingPage/BroadbandTestingCommunity/BroadbandTestingCommunity";
import BroadbandTestingHeader from "../src/components/BroadbandTestingPage/BroadbandTestingHeader/BroadbandTestingHeader";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";

const BroadbandTesting = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Broadband Speed Testing for Consumers and Communities';
  }, []);

  return (
    <ViewportContextProvider>
      <Frame isDifferentColorFooter>
        <div style={styles.BroadbandTestingPage}>
          <BroadbandTestingHeader />
          <BroadbandTestingCommunity />
          <BroadbandTestingSpeedtest />
          <BroadbandTestingMobile />
          <RadarRedirect marginTop={'-90px'}/>
        </div>
      </Frame>
    </ViewportContextProvider>
  );
}

export default BroadbandTesting;