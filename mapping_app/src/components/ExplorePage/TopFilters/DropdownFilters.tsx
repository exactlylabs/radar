import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DropdownFilters.style";
import DropdownFilter from "./DropdownFilter";
import CalendarIcon from '../../../assets/calendar-icon.png';
import ProvidersIcon from '../../../assets/providers-icon.png';
import SpeedIcon from '../../../assets/speeds-icon.png';
import DropdownFilterVerticalDivider from "./DropdownFilterVerticalDivider";
import {calendarFilters, filterTypes, speedFilters} from "../../../utils/filters";
import {getAsns} from "../../../api/asns/requests";
import {Asn} from "../../../api/asns/types";
import {handleError} from "../../../api";
import {Filter} from "../../../utils/types";


interface DropdownFiltersProps {
  changeFilters: (filters: Array<Filter>) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
}

const DropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
}: DropdownFiltersProps): ReactElement => {

  const [currentFilters, setCurrentFilters] = useState<Array<Filter>>([speedType, calendarType, provider]);
  const [providers, setProviders] = useState<Array<Asn>>([]);

  useEffect(() => {
    getAsns()
      .then(res => setProviders(res.results))
      .catch(err => handleError(err));
  }, []);

  const changeFilter = (newFilter: Filter, index: number) => {
    let filters: Array<Filter> = [...currentFilters];
    filters[index] = newFilter;
    setCurrentFilters(filters);
    changeFilters(filters);
  }

  const changeSpeedFilter = (newFilter: Filter) => {
    changeFilter(newFilter, 0);
  }

  const changeCalendarFilter = (newFilter: Filter) => {
    changeFilter(newFilter, 1);
  }

  const changeProviderFilter = (newFilter: Filter) => {
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
                      options={providers}
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