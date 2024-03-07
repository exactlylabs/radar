import React, {useContext} from 'react';
import './SpeedResultsBox.css';
import {DEFAULT_SPEED_FILTER_BACKGROUND_COLOR, DEFAULT_SPEED_FILTER_BOX_SHADOW, WHITE} from "../../utils/colors";
import MyFiltersSubtitle from "./MyFiltersSubtitle";
import MyFiltersTitle from "./MyFiltersTitle";
import MyFiltersTypeSwitcher from "./MyFiltersTypeSwitcher";
import MyFiltersList from "./MyFiltersList";
import FloatingExploreButton from "./FloatingExploreButton";
import ConfigContext from "../../context/ConfigContext";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const speedFiltersBoxStyle = {
  width: 255,
  borderRadius: 16,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  boxShadow: DEFAULT_SPEED_FILTER_BOX_SHADOW,
  position: 'absolute',
  zIndex: 1001,
  color: WHITE,
  padding: 20,
}

const mobileFiltersWrapper = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1001,
}

const mobileFilterListStyle = {
  width: 'max-content',
  maxWidth: 250,
  borderRadius: 16,
  paddingLeft: 15,
  paddingRight: 15,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  position: 'absolute',
  left: 15,
  zIndex: 2000,
 }

const xsFilterListStyle = {
  width: 'max-content',
  borderRadius: 16,
  padding: 8,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  position: 'absolute',
  left: 15,
  zIndex: 2000,
}

const mobileFilterSwitcherContainerStyle = {
  width: '50%',
  position: 'absolute',
  top: 0,
  left: 50,
  maxWidth: 250,
  height: 50,
  zIndex: 1001,
}

const filterTypes = ['download', 'upload'];

const SpeedResultsBox = ({
  setSelectedFilters,
  setSelectedRangeIndexes,
  selectedRangeIndexes,
  currentFilterType,
  setCurrentFilterType,
  isBoxOpen,
  setIsBoxOpen
}) => {

  const config = useContext(ConfigContext);
  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getSpeedResultsStyle = () => {
    return isMediumSizeScreen || isSmallSizeScreen ? mobileFiltersWrapper : {};
  }

  const handleFilterClick = filtersArray => {
    setSelectedRangeIndexes(filtersArray)
    setSelectedFilters(filterTypes[currentFilterType], filtersArray);
  };

  const handleChangeTab = (tabIndex) => {
    setSelectedRangeIndexes([]);
    setCurrentFilterType(tabIndex);
    setSelectedFilters(filterTypes[tabIndex], []);
  }

  // Reset all selected filters & tab
  const toggleBox = () => setIsBoxOpen(!isBoxOpen);

  const getContent = () => {
    if(isExtraSmallSizeScreen) return getExtraSmallVersion();
    return (isMediumSizeScreen || isSmallSizeScreen) ? getMobileVersion() : getDesktopVersion();
  }

  const getSpeedFiltersDesktopStyle = () => {
    return { ...speedFiltersBoxStyle, bottom: 35 , right: 26 };
  }

  const getDesktopVersion = () => (
    <div style={getSpeedFiltersDesktopStyle()}>
      <MyFiltersTitle text={'Explore the Map'}/>
      <MyFiltersSubtitle text={'Filter tests by speed results.'}/>
      <MyFiltersTypeSwitcher currentType={currentFilterType}
                             setCurrentType={handleChangeTab}
      />
      <MyFiltersList currentFilter={filterTypes[currentFilterType]}
                     selectedRangeIndexes={selectedRangeIndexes}
                     setSelectedRangeIndexes={handleFilterClick}
      />
    </div>
  );

  const getExtraSmallVersion = () => {
    let style = xsFilterListStyle;
    const element = document.getElementById('speedtest--main-frame');
    const {y, height} = element.getBoundingClientRect();
    if (config.webviewMode) {
      style = {...style, top: 'calc(100vh - 125px - 45px)'}
    } else if(config.widgetMode) {
      style = {...style, top: `calc(${config.frameStyle.height} - 60px - 54px - 56px - 70px - 40px)` }
    } else {
      style = {...style, top: (y + height - 300)}
    }
    return (
      <div style={style} id={'speedtest--speed-results-box--mobile-filters'}>
        <MyFiltersList currentFilter={filterTypes[currentFilterType]}
                       selectedRangeIndexes={selectedRangeIndexes}
                       setSelectedRangeIndexes={handleFilterClick}
        />
      </div>
    )
  }

  const getMobileVersion = () => {
    let style = mobileFilterListStyle;
    const element = document.getElementById('speedtest--main-frame');
    const {y, height} = element.getBoundingClientRect();
    if (config.webviewMode) {
      style = {...style, top: 'calc(100vh - 125px - 45px)'}
    } else if(config.widgetMode) {
      style = {...style, top: `calc(${config.frameStyle.height} - 95px - 54px - 56px - 70px - 40px)` }
    } else {
      style = {...style, top: (y + height - 300)}
    }
    return (
      <div style={style} id={'speedtest--speed-results-box--mobile-filters'}>
        <MyFiltersList currentFilter={filterTypes[currentFilterType]}
                       selectedRangeIndexes={selectedRangeIndexes}
                       setSelectedRangeIndexes={handleFilterClick}
        />
      </div>
    )
  }

  const getFloatingFilterTypeSwitch = () => {
    let style = mobileFilterSwitcherContainerStyle;
    if(config.widgetMode) {
      style = {...style, position: 'absolute', bottom: null, top: '-5px', left: 15 }
    } else if(config.webviewMode) {
      style = {...style, position: 'absolute', bottom: null, top: '-5px', left: config.noZoomControl ? 15 : 50}
    }
    return (
      <div style={style}>
        <MyFiltersTypeSwitcher currentType={currentFilterType}
                               setCurrentType={handleChangeTab}
        />
      </div>
    )
  }

  return (
    <div style={getSpeedResultsStyle()} id={'speedtest--speed-results-box--container'}>
      { isBoxOpen && (isMediumSizeScreen || isSmallSizeScreen) && getFloatingFilterTypeSwitch() }
      { isBoxOpen && getContent() }
      <FloatingExploreButton activeFiltersCount={selectedRangeIndexes.length}
                             isBoxOpen={isBoxOpen}
                             onClick={toggleBox}
      />
    </div>
  );
};

export default SpeedResultsBox;
