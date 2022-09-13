import {ReactElement} from "react";
import {styles} from "./styles/SecondLevelFooter.style";
import XLabLogo from '../../assets/xlab-logo.png';
import ANTHCLogo from '../../assets/anthc-logo.png';

const SecondLevelFooter = (): ReactElement => {
  return (
    <div style={styles.SecondLevelFooter()}>
      <div style={styles.LeftSideContainer()}>
        <p className={'fw-light'} style={styles.CopyrightText()}>Broadband Mapping © 2022. All rights reserved.</p>
      </div>
      <div style={styles.RightSideContainer()}>
        <p className={'fw-light'} style={styles.AssociationText()}>In association with:</p>
        <img src={XLabLogo} style={styles.FooterIcon()} alt={'xlab-logo'}/>
        <img src={ANTHCLogo} style={styles.FooterIcon()} alt={'anthc-logo'}/>
        {/* TODO: add once icon is exportable from Zeplin. <img src={ExactlyLabsLogo} style={styles.FooterIcon()} alt={'exactlylabs-logo'}/> */}
      </div>
    </div>
  )
}

export default SecondLevelFooter;