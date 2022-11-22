import {ReactElement} from "react";
import {styles} from "./styles/SpeedFilters.style";
import DropdownFilterVerticalDivider from "../TopFilters/DropdownFilterVerticalDivider";
import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../../../styles/colors";
import SpeedFilter from "./SpeedFilter";
import {speedTextsDownload, speedTextsUpload, speedTypes} from "../../../utils/speeds";
import {Filter} from "../../../utils/types";
import {speedFilters} from '../../../utils/filters';

interface SpeedFiltersProps {
  isRightPanelOpen: boolean;
  speedType: Filter;
  selectedSpeedFilters: Array<string>;
  setSelectedSpeedFilters: (filters: Array<string>) => void;
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

  const toggleUnserved = () => toggleFilter(speedTypes.UNSERVED);

  const toggleUnderserved = () => toggleFilter(speedTypes.UNDERSERVED);

  const toggleNormal = () => toggleFilter(speedTypes.SERVED);

  return (
    <div style={styles.SpeedFiltersContainer(isRightPanelOpen)}>
      <SpeedFilter boxColor={SPEED_UNSERVED}
                   text={speedType === speedFilters.DOWNLOAD ? speedTextsDownload.UNSERVED : speedTextsUpload.UNSERVED}
                   secondaryText={'(Unserved)'}
                   isChecked={selectedSpeedFilters.includes(speedTypes.UNSERVED)}
                   toggleFilter={toggleUnserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_UNDERSERVED}
                   text={speedType === speedFilters.DOWNLOAD ? speedTextsDownload.UNDERSERVED : speedTextsUpload.UNDERSERVED}
                   secondaryText={'(Underserved)'}
                   isChecked={selectedSpeedFilters.includes(speedTypes.UNDERSERVED)}
                   toggleFilter={toggleUnderserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_NORMAL}
                   text={speedType === speedFilters.DOWNLOAD ? speedTextsDownload.SERVED : speedTextsUpload.SERVED}
                   isChecked={selectedSpeedFilters.includes(speedTypes.SERVED)}
                   toggleFilter={toggleNormal}
      />
    </div>
  )
}

export default SpeedFilters;