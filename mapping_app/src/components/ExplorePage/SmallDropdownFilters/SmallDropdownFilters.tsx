/*
import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/SmallDropdownFilters.style";
import DropdownFilters from "../TopFilters/DropdownFilters";
import {Filter} from "../../../utils/types";
import SpeedIcon from "../../../assets/speeds-icon.png";
import {calendarFilters, filterTypes, speedFilters} from "../../../utils/filters";
import DropdownFilter from "../TopFilters/DropdownFilter";
import CalendarIcon from "../../../assets/calendar-icon.png";
import DropdownFilterVerticalDivider from "../TopFilters/DropdownFilterVerticalDivider";
import ProvidersIcon from "../../../assets/providers-icon.png";
import {Asn} from "../../../api/asns/types";
import {getAsns, getAsnsForGeospace} from "../../../api/asns/requests";
import {handleError} from "../../../api";
import {usePrev} from "../../../hooks/usePrev";

interface SmallDropdownFiltersProps {
  changeFilters: (filters: Array<Filter>) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
  openDatePicker: () => void;
  selectedGeospaceId?: string;
}

const SmallDropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
  openDatePicker,
  selectedGeospaceId
}: SmallDropdownFiltersProps): ReactElement => {

  const [providers, setProviders] = useState<Array<Asn>>([]);

  const prevFilters = usePrev({speedType, calendarType, provider});

  useEffect(() => {
    if(selectedGeospaceId) {
      getAsnsForGeospace(selectedGeospaceId)
        .then(res => { setProviders(res.results) })
        .catch(err => handleError(err));
    } else {
      getAsns()
        .then(res => {
          setProviders(res.results);
        })
        .catch(err => handleError(err));
    }
  }, [selectedGeospaceId]);

  useEffect(() => {
    if(prevFilters && prevFilters.speedType !== speedType) {
      changeSpeedFilter(speedType);
    } else if(prevFilters && prevFilters.calendarType !== calendarType) {
      changeCalendarFilter(calendarType);
    } else if(prevFilters && prevFilters.provider !== provider) {
      changeProviderFilter(provider);
    }
  }, [speedType, calendarType, provider]);

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
    <div style={styles.SmallDropdownFilters}>
      <DropdownFilter iconSrc={SpeedIcon}
                      options={speedFilters}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
                      changeFilter={() => {}}
                      selectedFilter={speedType}
                      setOpenFilter={() => {}}
                      openFilter={''}
                      loading={false}
      />
      <DropdownFilter iconSrc={CalendarIcon}
                      options={calendarFilters.includes((calendarType as string)) ? calendarFilters : [calendarType, ...calendarFilters]}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
                      changeFilter={() => {}}
                      selectedFilter={calendarType}
                      setOpenFilter={() => {}}
                      openFilter={''}
                      lastOptionTriggersFunction
                      lastOptionOnClick={openDatePicker}
                      loading={false}
      />
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
                      loading={providersLoading}
      />
    </div>
  )
}

export default SmallDropdownFilters;*/
