import {ReactElement} from "react";
import {styles} from "./styles/BroadbandTestingCommunity.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const OpenSourceIcon = '/assets/images/open-source-icon.png';
const BeyondSpeedsIcon = '/assets/images/beyond-speeds-icon.png';
const ReachOutIcon = '/assets/images/reach-out-icon.png';

const BroadbandTestingCommunity = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.BroadbandTestingCommunity(isSmall)}>
      <div style={styles.BroadbandTestingCommunityContent(isSmall)}>
        <div style={styles.TextContainer(isSmall)}>
          <p className={'fw-bold'} style={styles.Header(isSmall)}>Consumer Broadband Testing</p>
          <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Give your community a way to test their Internet connections.</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>White label our open-source Internet speed test tool to let your community or customers test their connections and find out what broadband looks like where they live.</p>
        </div>
        <div style={isSmall ? styles.VerticalContainer : styles.Row}>
          <div style={styles.Column(isSmall)}>
            <div style={styles.IconContainer}>
              <img src={OpenSourceIcon} style={styles.Icon} alt={'open-source-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.RowTitle(isSmall)}>White label, open-source</p>
            <p className={'fw-medium'} style={styles.RowSubtitle(isSmall)}>Our speed test tool can be white labeled and is fully open-source so you have full control over it.</p>
          </div>
          <div style={styles.Column(isSmall)}>
            <div style={styles.IconContainer}>
              <img src={BeyondSpeedsIcon} style={styles.Icon} alt={'open-source-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.RowTitle(isSmall)}>Not just speed</p>
            <p className={'fw-medium'} style={styles.RowSubtitle(isSmall)}>Go beyond simple upload and download speeds by capturing detailed performance metrics with every test.</p>
          </div>
          <div style={styles.Column(isSmall)}>
            <div style={styles.IconContainer}>
              <img src={ReachOutIcon} style={styles.Icon} alt={'open-source-icon'}/>
            </div>
            <p className={'fw-bold'} style={styles.RowTitle(isSmall)}>Extend your reach</p>
            <p className={'fw-medium'} style={styles.RowSubtitle(isSmall)}>Use our outreach resources to ensure greater engagement within your communities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BroadbandTestingCommunity;