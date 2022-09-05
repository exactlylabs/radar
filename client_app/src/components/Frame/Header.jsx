import {useState} from "react";
import {DEFAULT_HEADER_BACKGROUND_COLOR, DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR, WHITE} from '../../utils/colors';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';
import radarLogoLight from '../../assets/radar-logo-light.png';
import MenuCloseButton from '../../assets/menu-close-button.png';
import MenuOpenButton from '../../assets/menu-open-button.png';
import {useIsMediumSizeScreen} from "../../hooks/useIsMediumSizeScreen";
import {useIsSmallSizeScreen} from "../../hooks/useIsSmallSizeScreen";

const headerStyle = {
  backgroundColor: DEFAULT_HEADER_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 70,
  width: '100%',
  fontWeight: 'bold',
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
  width: '25%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: WHITE,
  fontSize: 16,
  minWidth: 250,
};

const rightSideContainerStyle = {
  width: '70%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
};

const navElementStyle = {
  cursor: 'pointer',
  color: WHITE,
};

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
  fontWeight: 'bold',
  position: 'absolute',
  top: 70,
  left: 0,
  paddingLeft: '5%',
  paddingRight: '5%',
  paddingTop: 15,
  paddingBottom: 15,
  zIndex: 2000,
}

const mobileNavElementStyle = {
  fontSize: 16,
  fontWeight: 'bold',
  color: WHITE,
  marginBottom: 15,
}

const horizontalDividerStyle = {
  width: '90%',
  height: 1,
  backgroundColor: DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR,
  marginBottom: 15,
}

const Header = ({ setStep }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMediumSizeScreen = useIsMediumSizeScreen();
  const isSmallSizeScreen = useIsSmallSizeScreen();

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
    <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileHeaderStyle : headerStyle}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <img
            src={radarLogoLight}
            alt={'Radar-logo=light'}
            width={104}
            height={25}
            onClick={goToHome}
            style={navElementStyle}
          />
          {!isMediumSizeScreen && !isSmallSizeScreen &&
            <div onClick={goToHome} style={navElementStyle}>
              Home
            </div>
          }
          {!isMediumSizeScreen && !isSmallSizeScreen && <div style={navElementStyle}>About Us</div>}
        </div>
        <div style={rightSideContainerStyle}>
          {
            isMediumSizeScreen || isSmallSizeScreen ?
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
        (isMediumSizeScreen || isSmallSizeScreen) && isMenuOpen &&
        <div style={collapsableContentStyle}>
          <div onClick={goToHome} style={mobileNavElementStyle}>Home</div>
          <div style={horizontalDividerStyle}></div>
          <div style={mobileNavElementStyle}>About Us</div>
          <div style={horizontalDividerStyle}></div>
          <MyButton text={'Test your speed'} onClick={goToTestSpeed}/>
        </div>
      }
    </div>
  );
};

export default Header;
