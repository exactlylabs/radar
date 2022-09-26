import {ReactElement, useState} from "react";
import {styles} from "./styles/SpeedFilters.style";
import DropdownFilterVerticalDivider from "../TopFilters/DropdownFilterVerticalDivider";
import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../../../styles/colors";
import SpeedFilter from "./SpeedFilter";

const speedFilters = {
  UNSERVED: 'UNSERVED',
  UNDERSERVED: 'UNDERSERVED',
  NORMAL: 'NORMAL',
};

interface SpeedFiltersProps {
  isRightPanelOpen: boolean;
}

const SpeedFilters = ({
  isRightPanelOpen
}: SpeedFiltersProps): ReactElement => {

  const [selectedFilters, setSelectedFilters] = useState<Array<string>>(Object.keys(speedFilters));

  const toggleFilter = (filter: string) => {
    let elements = [...selectedFilters];
    if(selectedFilters.includes(filter)) {
      const index = elements.indexOf(filter);
      elements.splice(index, 1);
    } else {
      elements.push(filter);
    }
    setSelectedFilters(elements);
  }

  const toggleUnserved = () => toggleFilter(speedFilters.UNSERVED);

  const toggleUnderserved = () => toggleFilter(speedFilters.UNDERSERVED);

  const toggleNormal = () => toggleFilter(speedFilters.NORMAL);

  return (
    <div style={styles.SpeedFiltersContainer(isRightPanelOpen)}>
      <SpeedFilter boxColor={SPEED_UNSERVED}
                   text={'<25 Mbps'}
                   secondaryText={'(Unserved)'}
                   isChecked={selectedFilters.includes(speedFilters.UNSERVED)}
                   toggleFilter={toggleUnserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_UNDERSERVED}
                   text={'25 - 100 Mbps'}
                   secondaryText={'(Underserved)'}
                   isChecked={selectedFilters.includes(speedFilters.UNDERSERVED)}
                   toggleFilter={toggleUnderserved}
      />
      <DropdownFilterVerticalDivider/>
      <SpeedFilter boxColor={SPEED_NORMAL}
                   text={'100+ Mbps'}
                   isChecked={selectedFilters.includes(speedFilters.NORMAL)}
                   toggleFilter={toggleNormal}
      />
    </div>
  )
}

export default SpeedFilters;