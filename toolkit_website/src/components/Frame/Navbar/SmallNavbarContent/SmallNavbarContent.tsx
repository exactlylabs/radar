import {ReactElement, useState} from "react";
import {styles} from "./styles/SmallNavbarContent.style";
import {AppRoutes} from "../../../../utils/navigation";
import SmallNavbarContentOpen from "./SmallNavbarContentOpen/SmallNavbarContentOpen";

const RadarLogo = "/assets/images/radar-logo.png";
const CloseIcon = '/assets/images/close-navbar-icon.png';
const OpenIcon = '/assets/images/hamburger-icon.png';

const SmallNavbarContent = (): ReactElement => {

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const closeNavbar = () => setIsNavbarOpen(false);
  const openNavbar = () => setIsNavbarOpen(true);

  return (
    <div style={styles.NavbarContentWrapper(isNavbarOpen)}>
      <div style={styles.NavbarContent(isNavbarOpen)}>
        <div>
          <a href={AppRoutes.HOME} style={styles.MarginlessLink}>
            <img className={'hover-opaque'} src={RadarLogo} style={styles.Logo} alt={'radar-logo'}/>
          </a>
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