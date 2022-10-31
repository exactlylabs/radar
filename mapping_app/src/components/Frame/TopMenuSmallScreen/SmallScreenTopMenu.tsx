import {ReactElement} from "react";
import {styles} from "./styles/ClosedTopMenuSmallScreen.style";
import HamburgerIcon from '../../../assets/hamburger-icon.png';
import CloseTopMenuIcon from '../../../assets/close-top-menu-icon.png';
import MappingLogo from '../../../assets/mapping-logo-responsive.png';

interface SmallScreenTopMenuProps {
  toggleTopMenu: () => void;
  isTopMenuOpen: boolean;
}

const SmallScreenTopMenu = ({
  toggleTopMenu,
  isTopMenuOpen
}: SmallScreenTopMenuProps): ReactElement => {
  return (
    <div style={styles.ClosedTopMenuContainer(isTopMenuOpen)}>
      <img className={'hover-opaque'}
           src={isTopMenuOpen ? CloseTopMenuIcon : HamburgerIcon}
           style={styles.Hamburger}
           alt={'toggle-top-menu-icon'}
           onClick={toggleTopMenu}
      />
      <img src={MappingLogo} style={styles.MappingLogo} alt={'mapping-logo'}/>
    </div>
  )
}

export default SmallScreenTopMenu;