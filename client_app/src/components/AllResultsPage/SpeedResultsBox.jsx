import React, {useContext, useState} from 'react';
import './SpeedResultsBox.css';
import {BLACK, DEFAULT_SPEED_FILTER_BACKGROUND_COLOR, DEFAULT_SPEED_FILTER_BOX_SHADOW, WHITE} from "../../utils/colors";
import MyFiltersSubtitle from "./MyFiltersSubtitle";
import MyFiltersTitle from "./MyFiltersTitle";
import MyFiltersTypeSwitcher from "./MyFiltersTypeSwitcher";
import MyFiltersList from "./MyFiltersList";
import FloatingExploreButton from "./FloatingExploreButton";
import ConfigContext from "../../context/ConfigContext";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const speedFiltersBoxStyle = {
  width: 255,
  height: 220,
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
  paddingTop: 15,
  paddingBottom: 15,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  position: 'absolute',
  left: 15,
  zIndex: 2000,
  height: 95,
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
  setSelectedFilters
}) => {

  const [isBoxOpen, setIsBoxOpen] = useState(true);
  const [currentFilterType, setCurrentFilterType] = useState(0);
  const [selectedRangeIndexes, setSelectedRangeIndexes] = useState([]);

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getSpeedResultsStyle = () => {
    let style = isMediumSizeScreen || isSmallSizeScreen ? mobileFiltersWrapper : {};
    return style;
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

  const getContent = () => isMediumSizeScreen || isSmallSizeScreen ? getMobileVersion() : getDesktopVersion();

  const getSpeedFiltersDesktopStyle = () => {
    return { ...speedFiltersBoxStyle, bottom: 35 , right: 26 };
  }

  const getDesktopVersion = () => (
    <div style={getSpeedFiltersDesktopStyle()} >
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

  const getMobileVersion = () => {
    let style = mobileFilterListStyle;
    const element = document.getElementById('main-frame');
    const {x, y, width, height} = element.getBoundingClientRect();
    style = {...style, top: (y + height - 300)}
    return (
      <div style={style} id={'speed-results-box--mobile-filters'}>
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
      const element = document.getElementById('main-frame');
      const {x, y, width, height} = element.getBoundingClientRect();
      style = {...style, position: 'absolute', bottom: null, top: 0, left: 50}
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
    <div style={getSpeedResultsStyle()} id={'speed-resss'}>
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
