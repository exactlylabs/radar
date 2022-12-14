import {ReactElement, useEffect} from "react";
import {styles} from "./styles/BroadbandTestingPage.style";
import RadarRedirect from "../common/RadarRedirect/RadarRedirect";
import BroadbandTestingMobile from "./BroadbandTestingMobile/BroadbandTestingMobile";
import BroadbandTestingSpeedtest from "./BroadbandTestingSpeedtest/BroadbandTestingSpeedtest";
import BroadbandTestingCommunity from "./BroadbandTestingCommunity/BroadbandTestingCommunity";
import BroadbandTestingHeader from "./BroadbandTestingHeader/BroadbandTestingHeader";

const BroadbandTestingPage = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Broadband Speed Testing for Consumers and Communities';
  }, []);

  return (
    <div style={styles.BroadbandTestingPage}>
      <div style={styles.BroadbandTestingPageContent}>
        <BroadbandTestingHeader />
        <BroadbandTestingCommunity />
        <BroadbandTestingSpeedtest />
        <BroadbandTestingMobile />
        <RadarRedirect />
      </div>
    </div>
  );
}

export default BroadbandTestingPage;