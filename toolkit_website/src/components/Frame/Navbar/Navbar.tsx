import {ReactElement} from "react";
import {styles} from "./styles/Navbar.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import SmallNavbarContent from "./SmallNavbarContent/SmallNavbarContent";
import RegularNavbarContent from "./RegularNavbarContent/RegularNavbarContent";

const Navbar = (): ReactElement => {

  const { isSmallScreen, isMidScreen } = useViewportSizes();
  const isSmallNavbar = isSmallScreen || isMidScreen;

  return (
    <div style={styles.Navbar(isSmallNavbar)}>
      { isSmallNavbar ? <SmallNavbarContent /> : <RegularNavbarContent/> }
    </div>
  )
}

export default Navbar;