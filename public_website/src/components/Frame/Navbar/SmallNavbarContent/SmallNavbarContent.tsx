import {ReactElement, useState} from "react";
import {styles} from "./styles/SmallNavbarContent.style";
import RadarLogo from "../../../../assets/images/radar-logo.png";
import CloseIcon from '../../../../assets/images/close-navbar-icon.png';
import OpenIcon from '../../../../assets/images/hamburger-icon.png';
import SmallNavbarContentOpen from "./SmallNavbarContentOpen/SmallNavbarContentOpen";
import {goToUrl} from "../../../../utils/navigation";

const SmallNavbarContent = (): ReactElement => {

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const closeNavbar = () => setIsNavbarOpen(false);
  const openNavbar = () => setIsNavbarOpen(true);

  const goToHome = () => goToUrl('/home');

  return (
    <div style={styles.NavbarContentWrapper(isNavbarOpen)}>
      <div style={styles.NavbarContent}>
        <div>
          <img className={'hover-opaque'} src={RadarLogo} style={styles.Logo} alt={'radar-logo'} onClick={goToHome}/>
          { isNavbarOpen ?
            <img className={'hover-opaque'} src={CloseIcon} style={styles.Icon} alt={'close-icon'} onClick={closeNavbar}/> :
            <img className={'hover-opaque'} src={OpenIcon} style={styles.Icon} alt={'open-icon'} onClick={openNavbar}/>
          }
        </div>
      </div>
      { isNavbarOpen && <SmallNavbarContentOpen /> }
    </div>
  )
}

export default SmallNavbarContent;