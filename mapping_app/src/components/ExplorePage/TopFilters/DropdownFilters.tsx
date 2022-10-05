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
import {Filter} from "../../../utils/types";
import {debounce} from "../../../api/utils/debouncer";
import {allProvidersElement} from "./utils/providers";
import {GeoJSONFilters} from "../../../api/geojson/types";

interface DropdownFiltersProps {
  changeFilters: (filters: GeoJSONFilters) => void;
  speedType: string;
  calendarType: string;
  provider: Asn;
}

const DropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
}: DropdownFiltersProps): ReactElement => {

  const [currentFilters, setCurrentFilters] = useState<GeoJSONFilters>({
    speedType: speedType,
    calendar: calendarType,
    provider: provider
  });
  const [providers, setProviders] = useState<Array<Asn>>([]);

  useEffect(() => {
    getAsns()
      .then(res => {
        setProviders([allProvidersElement, ...res.results]);
      })
      .catch(err => handleError(err));
  }, []);

  useEffect(() => {
    let filters: GeoJSONFilters = {
      speedType,
      calendar: calendarType,
      provider,
    };
    setCurrentFilters(filters);
  }, [speedType, calendarType, provider]);

  const updateFilters = (filters: GeoJSONFilters) => {
    setCurrentFilters(filters);
    changeFilters(filters);
  }

  const changeSpeedFilter = (newFilter: Filter) => {
    let filters: GeoJSONFilters = {
      ...currentFilters,
      speedType: newFilter as string,
    };
    updateFilters(filters);
  }

  const changeCalendarFilter = (newFilter: Filter) => {
    let filters: GeoJSONFilters = {
      ...currentFilters,
      calendar: newFilter as string
    };
    updateFilters(filters);
  }

  const changeProviderFilter = (newFilter: Filter) => {
    const filters: GeoJSONFilters = {
      ...currentFilters,
      provider: newFilter as Asn,
    };
    updateFilters(filters);
  }

  const handleProviderSearchbarChange = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    getAsns(value)
      .then(res => setProviders([allProvidersElement, ...res.results]))
      .catch(err => handleError(err));
  });

  return (
    <div style={styles.DropdownFiltersContainer}>
      <DropdownFilter icon={<img src={SpeedIcon} style={styles.Icon} alt={'speed-icon'}/>}
                      options={speedFilters}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
                      changeFilter={changeSpeedFilter}
                      selectedFilter={speedType}

      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={CalendarIcon} style={styles.Icon} alt={'speed-icon'}/>}
                      options={calendarFilters}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
                      changeFilter={changeCalendarFilter}
                      selectedFilter={calendarType}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={ProvidersIcon} style={styles.Icon} alt={'speed-icon'}/>}
                      options={providers}
                      withSearchbar
                      textWidth={'85px'}
                      type={filterTypes.PROVIDERS}
                      changeFilter={changeProviderFilter}
                      selectedFilter={provider}
                      searchbarOnChange={handleProviderSearchbarChange}
      />
    </div>
  )
}

export default DropdownFilters;