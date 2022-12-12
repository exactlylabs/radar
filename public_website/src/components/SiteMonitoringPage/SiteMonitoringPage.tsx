import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringPage.style";
import SiteMonitoringHeader from "./SiteMonitoringHeader/SiteMonitoringHeader";
import SiteMonitoringNetworkIssues from "./SiteMonitoringNetworkIssues/SiteMonitoringNetworkIssues";
import SiteMonitoringBulletpoints from "./SiteMonitoringBulletpoints/SiteMonitoringBulletpoints";
import RadarRedirect from "../common/RadarRedirect/RadarRedirect";


const SiteMonitoringPage = (): ReactElement => (
  <div style={styles.SiteMonitoringPage}>
    <div style={styles.SiteMonitoringPageContent}>
      <SiteMonitoringHeader/>
      <SiteMonitoringNetworkIssues />
      <SiteMonitoringBulletpoints />
      <RadarRedirect />
    </div>
  </div>
);

export default SiteMonitoringPage;