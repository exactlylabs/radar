import {useState} from "react";
import {DEFAULT_HEADER_BACKGROUND_COLOR, DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR} from '../../utils/colors';
import { MyButton } from '../common/MyButton';
import { TABS } from '../../constants';
import radarLogoLight from '../../assets/speedtest-logo.png';
import MenuCloseButton from '../../assets/menu-close-button.png';
import MenuOpenButton from '../../assets/menu-open-button.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";
import MyNavLink from "../common/MyNavLink";
import {CustomNarrowButton} from "../common/CustomNarrowButton";

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
  maxWidth: '1200px',
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
  minHeight: 100,
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

const Header = ({ setStep, isOverviewPage }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const goToHome = () => {
    if(isMenuOpen) setIsMenuOpen(false);
    setStep(TABS.SPEED_TEST);
  }

  const goToOverview = () => {
    setStep(TABS.OVERVIEW);
  }

  const goToExplore = () => {
    setStep(TABS.ALL_RESULTS);
  }

  const goToTestSpeed = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setStep(TABS.SPEED_TEST);
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={'bold'} style={isMediumSizeScreen || isSmallSizeScreen ? mobileHeaderStyle : headerStyle} id={'header--wrapper'}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <img
            src={radarLogoLight}
            alt={'Radar Speedtest logo'}
            width={170}
            height={26}
            onClick={goToHome}
            style={!(isSmallSizeScreen || isMediumSizeScreen) ? radarLogoStyle : null}
          />
          {!(isSmallSizeScreen || isMediumSizeScreen) && !isOverviewPage && <MyNavLink text={'Home'} onClick={goToHome}/>}
          { !(isSmallSizeScreen || isMediumSizeScreen) && <MyNavLink text={'Overview'} onClick={goToOverview}/> }
          { !(isSmallSizeScreen || isMediumSizeScreen) && isOverviewPage && <MyNavLink text={'Explore'} onClick={goToExplore}/> }
        </div>
        <div style={rightSideContainerStyle}>
          {
            (isSmallSizeScreen || isMediumSizeScreen) ?
              <img src={isMenuOpen ? MenuOpenButton : MenuCloseButton}
                   width={22}
                   height={22}
                   alt={'menu-close-button'}
                   style={menuCloseButtonStyle}
                   onClick={toggleMenu}
              /> :
              <CustomNarrowButton text={'Test your speed'} onClick={goToTestSpeed}/>
          }
        </div>
      </div>
      {
        (isMediumSizeScreen || isSmallSizeScreen) && isMenuOpen &&
        <div style={collapsableContentStyle}>
          { !isOverviewPage && <MyNavLink text={'Home'} onClick={goToHome} isCollapsed/> }
          <MyNavLink text={'Overview'} onClick={goToOverview} isCollapsed/>
          { isOverviewPage && <MyNavLink text={'Explore'} onClick={goToExplore} isCollapsed/> }
          <div style={horizontalDividerStyle}></div>
          <CustomNarrowButton text={'Test your speed'} onClick={goToTestSpeed}/>
        </div>
      }
    </div>
  );
};

export default Header;
