import {ChangeEvent, ReactElement, useEffect, useState} from "react";
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
import {Filter, Optional} from "../../../utils/types";
import {debounce} from "../../../api/utils/debouncer";

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
  const [openFilter, setOpenFilter] = useState<Optional<string>>(null);

  useEffect(() => {
    window.addEventListener('click', closeFiltersIfOutsideContainer);
    getAsns()
      .then(res => {
        setProviders(res.results);
      })
      .catch(err => handleError(err));
  }, []);

  useEffect(() => {
    setCurrentFilters([speedType, calendarType, provider]);
  }, [speedType, calendarType, provider]);

  const closeFiltersIfOutsideContainer = (e: MouseEvent) => {
    const filtersContainer: Optional<HTMLElement> = document.getElementById('dropdown-filters--container');
    if(filtersContainer && !filtersContainer.contains(e.target as Node)) {
      setOpenFilter(null);
    }
  }

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

  const handleProviderSearchbarChange = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    getAsns(value)
      .then(res => setProviders(res.results))
      .catch(err => handleError(err));
  });

  const clearProviderList = () => {
    getAsns()
      .then(res => setProviders(res.results))
      .catch(err => handleError(err));
  }

  return (
    <div style={styles.DropdownFiltersContainer} id={'dropdown-filters--container'}>
      <DropdownFilter iconSrc={SpeedIcon}
                      options={speedFilters}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
                      changeFilter={changeSpeedFilter}
                      selectedFilter={speedType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter iconSrc={CalendarIcon}
                      options={calendarFilters}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
                      changeFilter={changeCalendarFilter}
                      selectedFilter={calendarType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter iconSrc={ProvidersIcon}
                      options={providers}
                      withSearchbar
                      textWidth={'85px'}
                      type={filterTypes.PROVIDERS}
                      changeFilter={changeProviderFilter}
                      selectedFilter={provider}
                      searchbarOnChange={handleProviderSearchbarChange}
                      clearProviderList={clearProviderList}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
      />
    </div>
  )
}

export default DropdownFilters;