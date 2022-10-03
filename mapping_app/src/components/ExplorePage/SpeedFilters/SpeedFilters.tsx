import {ReactElement, useState} from "react";
import {styles} from "./styles/SpeedFilters.style";
import DropdownFilterVerticalDivider from "../TopFilters/DropdownFilterVerticalDivider";
import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../../../styles/colors";
import SpeedFilter from "./SpeedFilter";
import {speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import {Filter} from "../../../utils/types";

const speedFilters = {
  UNSERVED: 'UNSERVED',
  UNDERSERVED: 'UNDERSERVED',
  SERVED: 'SERVED',
};

interface SpeedFiltersProps {
  isRightPanelOpen: boolean;
  speedType: Filter;
  selectedSpeedFilters: Array<Filter>;
  setSelectedSpeedFilters: (filters: Array<Filter>) => void;
}

const SpeedFilters = ({
  isRightPanelOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters
}: SpeedFiltersProps): ReactElement => {

  const toggleFilter = (filter: string) => {
    let elements = [...selectedSpeedFilters];
    if(selectedSpeedFilters.includes(filter)) {
      const index = elements.indexOf(filter);
      elements.splice(index, 1);
    } else {
      elements.push(filter);
    }
    setSelectedSpeedFilters(elements);
  }

  const toggleUnserved = () => toggleFilter(speedFilters.UNSERVED);

  const toggleUnderserved = () => toggleFilter(speedFilters.UNDERSERVED);

  const toggleNormal = () => toggleFilter(speedFilters.SERVED);

  return (
    <div style={styles.SpeedFiltersContainer(isRightPanelOpen)}>
      <SpeedFilter boxColor={SPEED_UNSERVED}
                   text={speedType === 'Download' ? speedTextsDownload['UNSERVED'] : speedTextsUpload['UNSERVED']}
                   secondaryText={'(Unserved)'}
                   isChecked={selectedSpeedFilters.includes(speedFilters.UNSERVED)}
                   toggleFilter={toggleUnserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_UNDERSERVED}
                   text={speedType === 'Download' ? speedTextsDownload['UNDERSERVED'] : speedTextsUpload['UNDERSERVED']}
                   secondaryText={'(Underserved)'}
                   isChecked={selectedSpeedFilters.includes(speedFilters.UNDERSERVED)}
                   toggleFilter={toggleUnderserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_NORMAL}
                   text={speedType === 'Download' ? speedTextsDownload['SERVED'] : speedTextsUpload['SERVED']}
                   isChecked={selectedSpeedFilters.includes(speedFilters.SERVED)}
                   toggleFilter={toggleNormal}
      />
    </div>
  )
}

export default SpeedFilters;