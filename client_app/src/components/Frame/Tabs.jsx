import { useEffect, useState } from 'react';
import {
  DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR,
  DEFAULT_SELECTED_TAB_COLOR,
  DEFAULT_TABS_BACKGROUND_COLOR,
  DEFAULT_UNSELECTED_TAB_COLOR,
} from '../../utils/colors';
import { STEPS } from '../../constants';
import speedTestIconActive from '../../assets/test-icon-active.png';
import speedTestIconInactive from '../../assets/test-icon-inactive.png';
import exploreMapIconActive from '../../assets/explore-icon-active.png';
import exploreMapIconInactive from '../../assets/explore-icon-inactive.png';
import historyIconActive from '../../assets/history-icon-active.png';
import historyIconInactive from '../../assets/history-icon-inactive.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";

const tabsWrapperStyle = {
  width: '100%',
  height: 53,
  backgroundColor: DEFAULT_TABS_BACKGROUND_COLOR,
  borderBottom:  `solid 1px ${DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR}`
};

const tabsContentWrapperStyle = {
  height: '100%',
  width: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
};

const commonTabStyle = {
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  height: '100%',
  alignItems: 'center',
};

const commonTabTextStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: 'bold',
  color: DEFAULT_UNSELECTED_TAB_COLOR,
  height: '100%',
  paddingLeft: 30,
  paddingRight: 30,
  fontSize: 15,
};

const commonResponsiveTabTextStyle = {
  ...commonTabTextStyle,
  paddingLeft: 15,
  paddingRight: 15,
}

const testSpeedTabStyle = {
  ...commonTabStyle,
};

const historyTabStyle = {
  ...commonTabStyle,
}

const selectedTabTextStyle = {
  ...commonTabTextStyle,
  color: DEFAULT_SELECTED_TAB_COLOR,
};

const mobileSelectedTabTextStyle = {
  ...commonResponsiveTabTextStyle,
  color: DEFAULT_SELECTED_TAB_COLOR,
}

const selectedContentStyle = {
  color: DEFAULT_SELECTED_TAB_COLOR,
}

const exploreMapTabStyle = {
  ...commonTabStyle,
};

const tabIconStyle = {
  marginRight: 8,
};

const tabUnderlineStyle = {
  height: 2,
  width: '100%',
  backgroundColor: DEFAULT_TABS_BACKGROUND_COLOR,
};

const selectedTabUnderlineStyle = {
  ...tabUnderlineStyle,
  backgroundColor: DEFAULT_SELECTED_TAB_COLOR,
};

const TABS = {
  SPEED_TEST: 'speedTest',
  EXPLORE_MAP: 'exploreMap',
  HISTORY: 'history'
};

const Tabs = ({ step, setStep }) => {
  const [selectedTab, setSelectedTab] = useState(TABS.SPEED_TEST);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    if(step === STEPS.HISTORY && selectedTab !== TABS.HISTORY) setSelectedTab(TABS.HISTORY);
    else if (step === STEPS.ALL_RESULTS && selectedTab !== TABS.EXPLORE_MAP) setSelectedTab(TABS.EXPLORE_MAP);
    else if (step === STEPS.SPEED_TEST && selectedTab !== TABS.SPEED_TEST) setSelectedTab(TABS.SPEED_TEST);
  }, [step]);

  const goToExploreMap = () => {
    setSelectedTab(TABS.EXPLORE_MAP);
    setStep(STEPS.ALL_RESULTS);
  };

  const goToTestSpeed = () => {
    setSelectedTab(TABS.SPEED_TEST);
    setStep(STEPS.SPEED_TEST);
  };

  const goToHistory = () => {
    setSelectedTab(TABS.HISTORY);
    setStep(STEPS.HISTORY);
  }

  const getTabStyle = (tabName) => {
    if(selectedTab === tabName) {
      return isMediumSizeScreen || isSmallSizeScreen ? mobileSelectedTabTextStyle : selectedTabTextStyle;
    } else {
      return isMediumSizeScreen || isSmallSizeScreen ? commonResponsiveTabTextStyle : commonTabTextStyle;
    }
  }

  return (
    <div style={tabsWrapperStyle}>
      <div style={tabsContentWrapperStyle}>
        <div style={testSpeedTabStyle} onClick={goToTestSpeed}>
          <div style={getTabStyle(TABS.SPEED_TEST)}>
            <img
              src={selectedTab === TABS.SPEED_TEST ? speedTestIconActive : speedTestIconInactive}
              width={18}
              height={18}
              style={tabIconStyle}
              alt={selectedTab === TABS.SPEED_TEST ? 'speed-active' : 'speed-inactive'}
            />
            <div style={selectedTab === TABS.SPEED_TEST ? selectedContentStyle : null}>Speed Test</div>
          </div>
          <div style={selectedTab === TABS.SPEED_TEST ? selectedTabUnderlineStyle : tabUnderlineStyle}></div>
        </div>

        <div style={historyTabStyle} onClick={goToHistory}>
          <div style={getTabStyle(TABS.HISTORY)}>
            <img
              src={selectedTab === TABS.HISTORY ? historyIconActive : historyIconInactive}
              width={18}
              height={18}
              style={tabIconStyle}
              alt={selectedTab === TABS.HISTORY ? 'history-active' : 'history-inactive'}
            />
            <div style={selectedTab === TABS.HISTORY ? selectedContentStyle : null}>Your History</div>
          </div>
          <div style={selectedTab === TABS.HISTORY ? selectedTabUnderlineStyle : tabUnderlineStyle}></div>
        </div>

        <div style={exploreMapTabStyle} onClick={goToExploreMap}>
          <div style={getTabStyle(TABS.EXPLORE_MAP)}>
            <img
              src={selectedTab === TABS.EXPLORE_MAP ? exploreMapIconActive : exploreMapIconInactive}
              width={18}
              height={18}
              style={tabIconStyle}
              alt={selectedTab === TABS.EXPLORE_MAP ? 'explore-active' : 'explore-inactive'}
            />
            <div style={selectedTab === TABS.EXPLORE_MAP ? selectedContentStyle : null}>{ isMediumSizeScreen || isSmallSizeScreen ? 'Map' : 'Explore the Map'}</div>
          </div>
          <div style={selectedTab === TABS.EXPLORE_MAP ? selectedTabUnderlineStyle : tabUnderlineStyle}></div>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
