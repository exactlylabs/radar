import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringNetworkIssues.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const SiteMonitoringWaves = '/assets/images/site-monitoring-waves.png';
const UnderprovisionedIcon = '/assets/images/underprovisioned-icon.png';
const NetworkIssuesIcon = '/assets/images/network-issues-icon.png';
const QualityTimeIcon = '/assets/images/quality-time-icon.png';

const SiteMonitoringNetworkIssues = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.SiteMonitoringNetworkIssues(isSmall)}>
      <div style={styles.TextContainer(isSmall)}>
        <p className={'fw-bold'} style={styles.NetworkIssuesText(isSmall)}>Identify network issues</p>
        <p className={'fw-extra-bold'} style={styles.MainTitle(isSmall)}>See what’s wrong with your connectivity at a glance.</p>
        <p className={'fw-medium'} style={styles.MainSubtitle(isSmall)}>Our remote monitoring solution lets you identify well-known connectivity issues at any of your locations.</p>
      </div>
      <img src={SiteMonitoringWaves} style={styles.Waves(isSmall)} alt={'site-monitoring-waves'}/>
      <div style={styles.ItemsContainer(isSmall)}>
        <div style={styles.Item(isSmall)}>
          <div style={styles.ItemIconContainer}>
            <img src={UnderprovisionedIcon} style={styles.Icon} alt={'under-provisioned-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.ItemTitle}>Under provisioned links</p>
          <p className={'fw-medium'} style={styles.ItemSubtitle}>Do you routinely receive less bandwidth than you are paying for?</p>
        </div>
        <div style={styles.Item(isSmall)}>
          <div style={styles.ItemIconContainer}>
            <img src={NetworkIssuesIcon} style={styles.Icon} alt={'network-issues-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.ItemTitle}>Misconfigured networks</p>
          <p className={'fw-medium'} style={styles.ItemSubtitle}>Is a misconfigured router or switch reducing your Internet speed?</p>
        </div>
        <div style={styles.Item(isSmall)}>
          <div style={styles.ItemIconContainer}>
            <img src={QualityTimeIcon} style={styles.Icon} alt={'quality-time-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.ItemTitle}>Quality over time</p>
          <p className={'fw-medium'} style={styles.ItemSubtitle}>Are there times of day where your Internet is consistently slower than normal?</p>
        </div>
      </div>
    </div>
  );
}

export default SiteMonitoringNetworkIssues;