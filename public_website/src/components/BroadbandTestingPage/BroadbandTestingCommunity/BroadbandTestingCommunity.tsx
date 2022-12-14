import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingCommunity.style";
import OpenSourceIcon from '../../../assets/images/open-source-icon.png';
import BeyondSpeedsIcon from '../../../assets/images/beyond-speeds-icon.png';
import ReachOutIcon from '../../../assets/images/reach-out-icon.png';

const BroadbandTestingCommunity = (): ReactElement => (
  <div style={styles.BroadbandTestingCommunity}>
    <div style={styles.BroadbandTestingCommunityContent}>
      <div style={styles.TextContainer}>
        <p className={'fw-bold'} style={styles.Header}>Consumer Broadband Testing</p>
        <p className={'fw-extra-bold'} style={styles.Title}>Give your community a way to test their internet connections.</p>
        <p className={'fw-medium'} style={styles.Subtitle}>White-label our open-source speed test tool to let your community or your customers test their internet connection and find out what broadband looks like where they live.</p>
      </div>
      <div style={styles.Row}>
        <div style={styles.Column}>
          <div style={styles.IconContainer}>
            <img src={OpenSourceIcon} style={styles.Icon} alt={'open-source-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.RowTitle}>White-labelable & open-source</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Our speed test tool is white-labelable and is fully open-source so you have full control over it.</p>
        </div>
        <div style={styles.Column}>
          <div style={styles.IconContainer}>
            <img src={BeyondSpeedsIcon} style={styles.Icon} alt={'open-source-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.RowTitle}>Go beyond speeds</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Capture detailed information beyond what consumers are getting from their connections.</p>
        </div>
        <div style={styles.Column}>
          <div style={styles.IconContainer}>
            <img src={ReachOutIcon} style={styles.Icon} alt={'open-source-icon'}/>
          </div>
          <p className={'fw-bold'} style={styles.RowTitle}>Reach out further</p>
          <p className={'fw-medium'} style={styles.RowSubtitle}>Get support reaching out to ensure the largest portion of the community responses.</p>
        </div>
      </div>
    </div>
  </div>
);

export default BroadbandTestingCommunity;