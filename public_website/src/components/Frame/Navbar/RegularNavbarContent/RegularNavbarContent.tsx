import {ReactElement, useState} from "react";
import {styles} from "./styles/RegularNavbarContent.style";
import CustomButton from "../../../common/CustomButton/CustomButton";
import ToolkitFloatingMenu from "./ToolkitFloatingMenu/ToolkitFloatingMenu";
import {goToHome} from "../../../../utils/navigation";

const RadarLogo = "/assets/images/radar-logo.png";
const ChevronRight = "/assets/images/chevron-right-dark.png";

interface RegularNavbarContentProps {
  goToGetStarted: () => void;
}

const RegularNavbarContent = ({
  goToGetStarted
}: RegularNavbarContentProps): ReactElement => {

  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const openFloatingMenu = () => setIsFloatingMenuOpen(true);
  const closeFloatingMenu = () => {
    timeoutId = setTimeout(() => setIsFloatingMenuOpen(false), 100);
  }

  const handleSetIsOpen = (isOpen: boolean) => {
    if(isOpen && !!timeoutId) clearTimeout(timeoutId);
    setIsFloatingMenuOpen(isOpen);
  }

  return (
    <div style={styles.NavbarContent}>
      <img src={RadarLogo} style={styles.Logo} alt={'radar-logo'} onClick={goToHome}/>
      <div style={styles.TabsContainer}>
        <a className={'fw-bold hover-opaque'}
           href={'/overview'}
           style={styles.LeftLink}
        >
          Overview
        </a>
        <p className={'fw-bold hover-opaque'}
           style={styles.CenterLink}
           onMouseOver={openFloatingMenu}
           onMouseLeave={closeFloatingMenu}
        >
          Our Toolkit
        </p>
        <a className={'fw-bold hover-opaque'}
           href={'mailto:contact@exactlylabs.com'}
           style={styles.RightLink}
        >
          Contact Us
        </a>
      </div>
      <CustomButton backgroundColor={''}
                    color={''}
                    icon={<img src={ChevronRight} style={styles.ChevronRight} alt={'chevron-right'}/>}
                    text={'Get started'}
                    onClick={goToGetStarted}
      />
      { isFloatingMenuOpen && <ToolkitFloatingMenu setIsOpen={handleSetIsOpen}/> }
    </div>
  )
}

export default RegularNavbarContent;