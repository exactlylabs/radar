import {useState} from "react";
import {DEFAULT_HEADER_BACKGROUND_COLOR, DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR, WHITE} from '../../utils/colors';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';
import radarLogoLight from '../../assets/radar-logo-light.png';
import MenuCloseButton from '../../assets/menu-close-button.png';
import MenuOpenButton from '../../assets/menu-open-button.png';
import {useScreenSize} from "../../hooks/useScreenSize";
import MyNavLink from "../common/MyNavLink";

const headerStyle = {
  backgroundColor: DEFAULT_HEADER_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 70,
  width: '100%',
};

const mobileHeaderStyle = {
  ...headerStyle,

}

const contentWrapperStyle = {
  width: '90%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
};

const leftSideContainerStyle = {
  width: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  minWidth: 250,
};

const rightSideContainerStyle = {
  width: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
};

const radarLogoStyle = {
  marginRight: 66,
  cursor: 'pointer',
}

const menuCloseButtonStyle = {
  cursor: 'pointer'
}

const collapsableContentStyle = {
  width: '100%',
  height: 'max-content',
  minHeight: 200,
  backgroundColor: DEFAULT_HEADER_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  position: 'absolute',
  top: 70,
  left: 0,
  paddingLeft: '5%',
  paddingRight: '5%',
  paddingTop: 15,
  paddingBottom: 15,
  zIndex: 2000,
}

const horizontalDividerStyle = {
  width: '90%',
  height: 1,
  backgroundColor: DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR,
  marginBottom: 15,
}

const Header = ({ setStep }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useScreenSize();

  const goToHome = () => {
    if(isMenuOpen) setIsMenuOpen(false);
    setStep(STEPS.SPEED_TEST);
  }

  const goToTestSpeed = () => {
    if(isMenuOpen) setIsMenuOpen(false);
    setStep(STEPS.SPEED_TEST);
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={'bold'} style={isMobile ? mobileHeaderStyle : headerStyle}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <img
            src={radarLogoLight}
            alt={'Radar-logo=light'}
            width={104}
            height={25}
            onClick={goToHome}
            style={!isMobile ? radarLogoStyle : null}
          />
          {!isMobile && <MyNavLink text={'Home'} onClick={goToHome}/>}
          {!isMobile && <MyNavLink text={'About Us'}/>}
        </div>
        <div style={rightSideContainerStyle}>
          {
            isMobile ?
              <img src={isMenuOpen ? MenuOpenButton : MenuCloseButton}
                   width={22}
                   height={22}
                   alt={'menu-close-button'}
                   style={menuCloseButtonStyle}
                   onClick={toggleMenu}
              /> :
              <MyButton text={'Test your speed'} onClick={goToTestSpeed}/>
          }
        </div>
      </div>
      {
        isMobile && isMenuOpen &&
        <div style={collapsableContentStyle}>
          <MyNavLink text={'Home'} onClick={goToHome} isCollapsed/>
          <div style={horizontalDividerStyle}></div>
          <MyNavLink text={'About Us'} isCollapsed/>
          <div style={horizontalDividerStyle}></div>
          <MyButton text={'Test your speed'} onClick={goToTestSpeed}/>
        </div>
      }
    </div>
  );
};

export default Header;
