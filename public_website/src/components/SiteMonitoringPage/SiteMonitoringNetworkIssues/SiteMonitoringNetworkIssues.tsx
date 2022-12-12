import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringNetworkIssues.style";
import SiteMonitoringWaves from '../../../assets/images/site-monitoring-waves.png';
import UnderprovisionedIcon from '../../../assets/images/underprovisioned-icon.png';
import NetworkIssuesIcon from '../../../assets/images/network-issues-icon.png';
import QualityTimeIcon from '../../../assets/images/quality-time-icon.png';

const SiteMonitoringNetworkIssues = (): ReactElement => (
  <div style={styles.SiteMonitoringNetworkIssues}>
    <div style={styles.TextContainer}>
      <p className={'fw-bold'} style={styles.NetworkIssuesText}>Identify network issues</p>
      <p className={'fw-extra-bold'} style={styles.MainTitle}>See what’s wrong with your connectivity at a glance.</p>
      <p className={'fw-medium'} style={styles.MainSubtitle}>Our remote monitoring solution lets you find out well-known connectivity issues at any of your locations.</p>
    </div>
    <img src={SiteMonitoringWaves} style={styles.Waves} alt={'site-monitoring-waves'}/>
    <div style={styles.ItemsContainer}>
      <div style={styles.Item}>
        <div style={styles.ItemIconContainer}>
          <img src={UnderprovisionedIcon} style={styles.Icon} alt={'underprovisioned-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.ItemTitle}>Under provisioned links</p>
        <p className={'fw-medium'} style={styles.ItemSubtitle}>Are you getting consistently less bandwidth than you signed up for?</p>
      </div>
      <div style={styles.Item}>
        <div style={styles.ItemIconContainer}>
          <img src={NetworkIssuesIcon} style={styles.Icon} alt={'network-issues-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.ItemTitle}>Miss-configured networks</p>
        <p className={'fw-medium'} style={styles.ItemSubtitle}>Is there a miss-configured router or switch resulting in lower bandwidth?</p>
      </div>
      <div style={styles.Item}>
        <div style={styles.ItemIconContainer}>
          <img src={QualityTimeIcon} style={styles.Icon} alt={'quality-time-icon'}/>
        </div>
        <p className={'fw-bold'} style={styles.ItemTitle}>Quality over time</p>
        <p className={'fw-medium'} style={styles.ItemSubtitle}>Are there specific times of day where you’re not getting the throughput you pay for?</p>
      </div>
    </div>
  </div>
);

export default SiteMonitoringNetworkIssues;