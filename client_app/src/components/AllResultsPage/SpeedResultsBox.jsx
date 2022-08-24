import React, {useState} from 'react';
import './SpeedResultsBox.css';
import {DEFAULT_SPEED_FILTER_BACKGROUND_COLOR, DEFAULT_SPEED_FILTER_BOX_SHADOW, WHITE} from "../../utils/colors";
import MyFiltersSubtitle from "./MyFiltersSubtitle";
import MyFiltersTitle from "./MyFiltersTitle";
import MyFiltersTypeSwitcher from "./MyFiltersTypeSwitcher";
import MyFiltersList from "./MyFiltersList";
import FloatingExploreButton from "./FloatingExploreButton";

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

const filterTypes = ['download', 'upload'];

const SpeedResultsBox = ({
  setSelectedFilters
}) => {

  const [isBoxOpen, setIsBoxOpen] = useState(true);
  const [currentFilterType, setCurrentFilterType] = useState(0);
  const [selectedRangeIndexes, setSelectedRangeIndexes] = useState([]);

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

  return (
    <div>
      {
        isBoxOpen &&
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
      }
      <FloatingExploreButton activeFiltersCount={selectedRangeIndexes.length}
                             isBoxOpen={isBoxOpen}
                             onClick={toggleBox}
      />
    </div>
  );
};

export default SpeedResultsBox;
