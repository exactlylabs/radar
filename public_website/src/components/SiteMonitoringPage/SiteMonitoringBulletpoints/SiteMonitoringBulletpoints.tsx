import {ReactElement} from "react";
import {styles} from "./styles/SiteMonitoringBulletpoints.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const SiteMonitoringTwoCards = '/assets/images/site-monitoring-two-cards.png';
const SmallSiteMonitoringTwoCards = '/assets/images/small-site-monitoring-two-cards.png';
const RouterIcon = '/assets/images/router-icon.png';
const OwnDevicesIcon = '/assets/images/own-devices-icon.png';
const AnalyzeTimeIcon = '/assets/images/analyze-time-icon.png';

const RegularSiteMonitoringBulletPointsContent = () => (
  <>
    <div style={styles.LeftColumn}>
      <p className={'fw-bold'} style={styles.Header}>Location Monitoring</p>
      <p className={'fw-extra-bold'} style={styles.Title}>Continuous & autonomous monitoring for your home or business.</p>
      <img src={SiteMonitoringTwoCards} style={styles.Cards} alt={'site-monitoring-two-cards'}/>
    </div>
    <div style={styles.RightColumn}>
      <div style={styles.Row}>
        <div style={styles.RowIconContainer(false)}>
          <img src={RouterIcon} style={styles.RowIcon} alt={'router-icon'}/>
        </div>
        <div style={styles.RowTextContainer(false)}>
          <p className={'fw-bold'} style={styles.RowTitle}>Keep an eye on the network</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Let us monitor your Internet quality with our Pods. These are small devices that you can put in your location to keep track of your network conditions.</p>
        </div>
      </div>
      <div style={styles.Row}>
        <div style={styles.RowIconContainer(false)}>
          <img src={OwnDevicesIcon} style={styles.RowIcon} alt={'own-devices-icon'}/>
        </div>
        <div style={styles.RowTextContainer(false)}>
          <p className={'fw-bold'} style={styles.RowTitle}>Use your own devices</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Get ours or use your own devices. We can supply you with Pods for your site or alternatively you can install our software on your own computer.</p>
        </div>
      </div>
      <div style={styles.Row}>
        <div style={styles.RowIconContainer(false)}>
          <img src={AnalyzeTimeIcon} style={styles.RowIcon} alt={'analyze-time-icon'}/>
        </div>
        <div style={styles.RowTextContainer(false)}>
          <p className={'fw-bold'} style={styles.RowTitle}>Analyze data over time</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Check your location’s network performance through a secure and accessible web portal. Anytime. Anywhere.</p>
        </div>
      </div>
    </div>
  </>
);

const SmallSiteMonitoringBulletPointsContent = () => (
  <>
    <p className={'fw-bold'} style={styles.Header}>Location Monitoring</p>
    <p className={'fw-extra-bold'} style={styles.Title}>Continuous & autonomous monitoring for your home or business.</p>
    <div style={styles.SmallRow}>
      <div style={styles.RowIconContainer(true)}>
        <img src={RouterIcon} style={styles.RowIcon} alt={'router-icon'}/>
      </div>
      <div style={styles.RowTextContainer(true)}>
        <p className={'fw-bold'} style={styles.RowTitle}>Keep an eye on the network</p>
        <p className={'fw-medium'} style={styles.RowSubtitle}>Let us monitor your Internet quality with our Pods. These are small devices that you can put in your location to keep track of your network conditions.</p>
      </div>
    </div>
    <div style={styles.SmallRow}>
      <div style={styles.RowIconContainer(true)}>
        <img src={OwnDevicesIcon} style={styles.RowIcon} alt={'own-devices-icon'}/>
      </div>
      <div style={styles.RowTextContainer(true)}>
        <p className={'fw-bold'} style={styles.RowTitle}>Use your own devices</p>
        <p className={'fw-medium'} style={styles.RowSubtitle}>Get ours or use your own devices. We can supply you with Pods for your location or alternatively you can install our software on your own computer.</p>
      </div>
    </div>
    <div style={styles.SmallRow}>
      <div style={styles.RowIconContainer(true)}>
        <img src={AnalyzeTimeIcon} style={styles.RowIcon} alt={'analyze-time-icon'}/>
      </div>
      <div style={styles.RowTextContainer(true)}>
        <p className={'fw-bold'} style={styles.RowTitle}>Analyze data over time</p>
        <p className={'fw-medium'} style={styles.RowSubtitle}>Check your location’s network performance through a secure and accessible web portal. Anytime. Anywhere.</p>
      </div>
    </div>
    <img src={SmallSiteMonitoringTwoCards} style={styles.SmallCards} alt={'site-monitoring-two-cards'}/>
  </>
)

const SiteMonitoringBulletpoints = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.SiteMonitoringBulletPoints(isSmall)}>
      <div style={styles.SiteMonitoringBulletPointsContent(isSmall)}>
        { isSmall ? <SmallSiteMonitoringBulletPointsContent/> : <RegularSiteMonitoringBulletPointsContent/> }
      </div>
    </div>
  );
}

export default SiteMonitoringBulletpoints;