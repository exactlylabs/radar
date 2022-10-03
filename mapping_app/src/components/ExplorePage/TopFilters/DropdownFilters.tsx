import {ReactElement, useState} from "react";
import {styles} from "./styles/DropdownFilters.style";
import DropdownFilter from "./DropdownFilter";
import CalendarIcon from '../../../assets/calendar-icon.png';
import ProvidersIcon from '../../../assets/providers-icon.png';
import SpeedIcon from '../../../assets/speeds-icon.png';
import DropdownFilterVerticalDivider from "./DropdownFilterVerticalDivider";
import {calendarFilters, filterTypes, providerFilters, speedFilters} from "../../../utils/filters";


interface DropdownFiltersProps {
  changeFilters: (filters: Array<string>) => void;
  speedType: string;
  calendarType: string;
  provider: string;
}

const DropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
}: DropdownFiltersProps): ReactElement => {

  const [currentFilters, setCurrentFilters] = useState<Array<string>>([speedType, calendarType, provider]);

  const changeFilter = (newFilter: string, index: number) => {
    let filters: Array<string> = [...currentFilters];
    filters[index] = newFilter;
    setCurrentFilters(filters);
    changeFilters(filters);
  }

  const changeSpeedFilter = (newFilter: string) => {
    changeFilter(newFilter, 0);
  }

  const changeCalendarFilter = (newFilter: string) => {
    changeFilter(newFilter, 1);
  }

  const changeProviderFilter = (newFilter: string) => {
    changeFilter(newFilter, 2);
  }

  return (
    <div style={styles.DropdownFiltersContainer()}>
      <DropdownFilter icon={<img src={SpeedIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={speedFilters}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
                      changeFilter={changeSpeedFilter}
                      selectedFilter={speedType}

      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={CalendarIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={calendarFilters}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
                      changeFilter={changeCalendarFilter}
                      selectedFilter={calendarType}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={ProvidersIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={providerFilters}
                      withSearchbar
                      textWidth={'85px'}
                      type={filterTypes.PROVIDERS}
                      changeFilter={changeProviderFilter}
                      selectedFilter={provider}
      />
    </div>
  )
}

export default DropdownFilters;