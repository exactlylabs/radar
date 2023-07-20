import {ReactElement} from "react";
import {styles} from "./styles/SecondLevelFooter.style";
import XLabLogo from '../../assets/xlab-logo.png';
import ANTHCLogo from '../../assets/anthc-logo.png';
import ExactlyLabsLogo from '../../assets/exactly-logo.png';
import {goToExactlyLabsWebsite} from "../../utils/redirects";

const SecondLevelFooter = (): ReactElement => {
  return (
    <div style={styles.SecondLevelFooter}>
      <div style={styles.LeftSideContainer}>
        <p className={'fw-light'} style={styles.CopyrightText}>Broadband Mapping © 2022. All rights reserved.</p>
        <p className={'fw-light'} style={styles.DevInfoText}>This project was developed as part of the Telehealth Broadband Pilot Program.<br/>The Telehealth Broadband Pilot Program is made possible by grant #GA540183 from the Office for the Advancement of Telehealth, Health Resources and Services Administration, DHHS.</p>
      </div>
      <div style={styles.RightSideContainer}>
        <p className={'fw-light'} style={styles.AssociationText}>In association with:</p>
        <img src={ANTHCLogo} style={styles.FooterIcon} alt={'anthc-logo'}/>
        <img src={ExactlyLabsLogo} style={styles.ExactlyIcon} alt={'exactlylabs-logo'} onClick={goToExactlyLabsWebsite}/>
        <img src={XLabLogo} style={styles.FooterIcon} alt={'xlab-logo'}/>
      </div>
    </div>
  )
}

export default SecondLevelFooter;