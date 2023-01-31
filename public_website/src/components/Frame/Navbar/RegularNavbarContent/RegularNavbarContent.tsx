import {ReactElement, useEffect, useRef, useState} from "react";
import {styles} from "./styles/RegularNavbarContent.style";
import CustomButton from "../../../common/CustomButton/CustomButton";
import ToolkitFloatingMenu from "./ToolkitFloatingMenu/ToolkitFloatingMenu";
import {AppRoutes, DEFAULT_MAIL_TO, emailContact} from "../../../../utils/navigation";
import { useIsTouchDevice } from "../../../../hooks/useIsTouchDevice";

const RadarLogo = "/assets/images/radar-logo.png";
const ChevronRight = "/assets/images/chevron-right-dark.png";

interface RegularNavbarContentProps {
  goToGetStarted: () => void;
}

const RegularNavbarContent = ({
  goToGetStarted
}: RegularNavbarContentProps): ReactElement => {

  const isTouchDevice = useIsTouchDevice().current;

  console.log(isTouchDevice);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const floatingMenuOpenRef = useRef(false);
  let timeoutId: NodeJS.Timeout;

  useEffect(() => {
    if(isTouchDevice) window.addEventListener('click', closeMenuIfClickOutside);

    return () => {
      if(isTouchDevice) window.removeEventListener('click', closeMenuIfClickOutside);
    }
  }, []);

  const closeMenuIfClickOutside = (e: any) => {
    const possibleElement = document.getElementById('toolkit-floating-menu--container');
    if(e.target.id === 'toolkit-link--floating-menu-toggle') return;
    if (
      possibleElement &&
      !possibleElement.contains(e.target) && 
      floatingMenuOpenRef.current
    ) {
      setIsFloatingMenuOpen(false);
      floatingMenuOpenRef.current = false;
    }
  }

  const openFloatingMenu = () => {
    setIsFloatingMenuOpen(true);
    floatingMenuOpenRef.current = true;
  }

  const closeFloatingMenu = () => {
    timeoutId = setTimeout(() => { 
      setIsFloatingMenuOpen(false);
      floatingMenuOpenRef.current = false 
    }, 100);
  }

  const toggleFloatingMenu = () => {
    setIsFloatingMenuOpen(!isFloatingMenuOpen);
    floatingMenuOpenRef.current = !floatingMenuOpenRef.current;
  }

  const handleSetIsOpen = (isOpen: boolean) => {
    if(isOpen && !!timeoutId) clearTimeout(timeoutId);
    setIsFloatingMenuOpen(isOpen);
    floatingMenuOpenRef.current = isOpen;
  }

  return (
    <div style={styles.NavbarContent}>
      <a href={AppRoutes.HOME} style={styles.MarginlessLink}>
        <img src={RadarLogo} style={styles.Logo} alt={'radar-logo'}/>
      </a>
      <div style={styles.TabsContainer}>
        <a className={'fw-bold hover-opaque'}
           href={AppRoutes.HOME}
           style={styles.LeftLink}
        >
          Overview
        </a>
        <p className={'fw-bold hover-opaque'}
           style={styles.CenterLink}
           onMouseOver={isTouchDevice ? undefined : openFloatingMenu}
           onMouseLeave={isTouchDevice ? undefined : closeFloatingMenu}
           onClick={isTouchDevice ? toggleFloatingMenu : undefined}
           id='toolkit-link--floating-menu-toggle'
        >
          Our Toolkit
        </p>
        <a className={'fw-bold hover-opaque'}
           href={DEFAULT_MAIL_TO}
           style={styles.RightLink}
        >
          Contact Us
        </a>
      </div>
      <CustomButton backgroundColor={''}
                    color={''}
                    icon={<img src={ChevronRight} style={styles.ChevronRight} alt={'chevron-right'}/>}
                    text={'Get started'}
                    link={DEFAULT_MAIL_TO}
      />
      { isFloatingMenuOpen && <ToolkitFloatingMenu setIsOpen={handleSetIsOpen}/> }
    </div>
  )
}

export default RegularNavbarContent;