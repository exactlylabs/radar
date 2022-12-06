import {ReactElement} from "react";
import {styles} from "./styles/Navbar.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import SmallNavbarContent from "./SmallNavbarContent/SmallNavbarContent";
import RegularNavbarContent from "./RegularNavbarContent/RegularNavbarContent";

const Navbar = (): ReactElement => {

  const { isSmallScreen, isMidScreen } = useViewportSizes();
  const isSmallNavbar = isSmallScreen || isMidScreen;

  const goToGetStarted = () => {}

  return (
    <div style={styles.Navbar}>
      { isSmallNavbar ? <SmallNavbarContent /> : <RegularNavbarContent goToGetStarted={goToGetStarted}/> }
    </div>
  )
}

export default Navbar;