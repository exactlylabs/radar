import {ReactElement, useEffect} from "react";
import {styles} from "./styles/SiteMonitoringPage.style";
import SiteMonitoringHeader from "./SiteMonitoringHeader/SiteMonitoringHeader";
import SiteMonitoringNetworkIssues from "./SiteMonitoringNetworkIssues/SiteMonitoringNetworkIssues";
import SiteMonitoringBulletpoints from "./SiteMonitoringBulletpoints/SiteMonitoringBulletpoints";
import RadarRedirect from "../common/RadarRedirect/RadarRedirect";


const SiteMonitoringPage = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Remote Monitoring of your Sites’ Internet Connectivity';
  }, []);

  return (
    <div style={styles.SiteMonitoringPage}>
      <div style={styles.SiteMonitoringPageContent}>
        <SiteMonitoringHeader/>
        <SiteMonitoringNetworkIssues />
        <SiteMonitoringBulletpoints />
        <RadarRedirect />
      </div>
    </div>
  );
}

export default SiteMonitoringPage;