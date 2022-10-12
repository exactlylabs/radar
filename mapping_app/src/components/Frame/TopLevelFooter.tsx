import {ReactElement} from "react";
import {styles} from "./styles/TopLevelFooter.style";
import MappingLogoGray from '../../assets/mapping-logo-gray.png';

const TopLevelFooter = (): ReactElement => {
  return (
    <div style={styles.TopLevelFooter}>
      <div style={styles.LeftSideContainer}>
        <img src={MappingLogoGray} style={styles.MappingLogo} alt={'mapping-logo-gray'}/>
      </div>
      <div style={styles.RightSideContainer}>
        {/* TODO: removing these until we have designs for both pages */}
        {/*<a className={'fw-medium hover-opaque'} href={'/privacy'} style={styles.Link()}>Privacy Policy</a>*/}
        {/*<a className={'fw-medium hover-opaque'} href={'/contact'} style={styles.Link()}>Contact Us</a>*/}
      </div>
    </div>
  )
}

export default TopLevelFooter;
