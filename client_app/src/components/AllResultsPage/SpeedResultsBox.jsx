import React, {useState} from 'react';
import './SpeedResultsBox.css';
import {BLACK, DEFAULT_SPEED_FILTER_BACKGROUND_COLOR, DEFAULT_SPEED_FILTER_BOX_SHADOW, WHITE} from "../../utils/colors";
import MyFiltersSubtitle from "./MyFiltersSubtitle";
import MyFiltersTitle from "./MyFiltersTitle";
import MyFiltersTypeSwitcher from "./MyFiltersTypeSwitcher";
import MyFiltersList from "./MyFiltersList";
import FloatingExploreButton from "./FloatingExploreButton";
import {useMobile} from "../../hooks/useMobile";

const speedFiltersBoxStyle = {
  width: 255,
  height: 220,
  borderRadius: 16,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  boxShadow: DEFAULT_SPEED_FILTER_BOX_SHADOW,
  position: 'absolute',
  bottom: 200,
  right: 25,
  zIndex: 1000,
  color: WHITE,
  padding: 20,
}

const mobileFiltersContainer = {
  width: '70%',
  height: 230,
  zIndex: 1001,
  position: 'relative',
  left: 0,
  top: 0,
}

const mobileFiltersWrapper = {
  position: 'relative',
  bottom: 240,
  left: 0,
  width: '100%',
  height: 225,
  zIndex: 1000,
}

const mobileFilterListStyle = {
  width: 'calc(85% - 30px)',
  maxWidth: 250,
  borderRadius: 16,
  paddingLeft: 15,
  paddingRight: 15,
  paddingTop: 15,
  paddingBottom: 15,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  position: 'absolute',
  bottom: 15,
  left: 15,
}

const mobileFilterSwitcherContainerStyle = {
  width: '50%',
  position: 'absolute',
  top: 'calc(-100vh + 170%)',
  left: 15,
  maxWidth: 250,
}

const filterTypes = ['download', 'upload'];

const SpeedResultsBox = ({
  setSelectedFilters
}) => {

  const [isBoxOpen, setIsBoxOpen] = useState(true);
  const [currentFilterType, setCurrentFilterType] = useState(0);
  const [selectedRangeIndexes, setSelectedRangeIndexes] = useState([]);

  const isMobile = useMobile();

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
  const toggleBox = () => {
    setIsBoxOpen(!isBoxOpen);
  }

  const getContent = () => isMobile ? getMobileVersion() : getDesktopVersion();

  const getDesktopVersion = () => (
    <div style={speedFiltersBoxStyle}>
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

  const getMobileVersion = () => (
    <div style={mobileFiltersContainer}>
      <div style={mobileFilterListStyle}>
        <MyFiltersList currentFilter={filterTypes[currentFilterType]}
                       selectedRangeIndexes={selectedRangeIndexes}
                       setSelectedRangeIndexes={handleFilterClick}
        />
      </div>
    </div>
  )

  const getFloatingFilterTypeSwitch = () => (
    <div style={mobileFilterSwitcherContainerStyle}>
      <MyFiltersTypeSwitcher currentType={currentFilterType}
                             setCurrentType={handleChangeTab}
      />
    </div>
  )

  return (
    <div style={isMobile ? mobileFiltersWrapper : null}>
      { isBoxOpen && isMobile && getFloatingFilterTypeSwitch() }
      { isBoxOpen && getContent() }
      <FloatingExploreButton activeFiltersCount={selectedRangeIndexes.length}
                             isBoxOpen={isBoxOpen}
                             onClick={toggleBox}
      />
    </div>
  );
};

export default SpeedResultsBox;
