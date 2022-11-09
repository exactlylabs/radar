import React, {ChangeEvent, MouseEventHandler, ReactElement, useEffect, useRef, useState} from "react";
import {styles} from "./styles/DropdownFilters.style";
import DropdownFilter from "./DropdownFilter";
import CalendarIcon from '../../../assets/calendar-icon.png';
import ProvidersIcon from '../../../assets/providers-icon.png';
import SpeedIcon from '../../../assets/speeds-icon.png';
import DropdownFilterVerticalDivider from "./DropdownFilterVerticalDivider";
import {calendarFilters, filterTypes, speedFilters} from "../../../utils/filters";
import {getAsns, getAsnsForGeospace} from "../../../api/asns/requests";
import {Asn} from "../../../api/asns/types";
import {handleError} from "../../../api";
import {Filter, Optional} from "../../../utils/types";
import {debounce} from "../../../api/utils/debouncer";
import {usePrev} from '../../../hooks/usePrev';
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import './styles/DropdownFilters.css';
import filters from "./Filters";

type ScrollPosition = {
  clientX: number;
  scrollX: number;
}

interface DropdownFiltersProps {
  changeFilters: (filters: Array<Filter>) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
  openDatePicker: () => void;
  selectedGeospaceId?: string;
  isInsideContainer?: boolean;
  openFilterMenu?: (filter: string) => void;
}

const DropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
  openDatePicker,
  selectedGeospaceId,
  isInsideContainer,
  openFilterMenu
}: DropdownFiltersProps): ReactElement => {

  const {isSmallerThanMid} = useViewportSizes();

  const [currentFilters, setCurrentFilters] = useState<Array<Filter>>([speedType, calendarType, provider]);
  const [providers, setProviders] = useState<Array<Asn>>([]);
  const [openFilter, setOpenFilter] = useState<Optional<string>>(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({clientX: 0, scrollX: 0});

  const prevFilters = usePrev({speedType, calendarType, provider});
  const sliderRef = useRef<HTMLDivElement>(null);

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
    setProvidersLoading(true);
    const value: string = e.target.value;
    if(selectedGeospaceId) {
       getAsnsForGeospace(selectedGeospaceId, value)
         .then(res => setProviders(res.results))
         .catch(err => handleError(err))
         .finally(() => setProvidersLoading(false));
    } else {
      getAsns(value)
        .then(res => setProviders(res.results))
        .catch(err => handleError(err))
        .finally(() => setProvidersLoading(false));
    }
  });

  const clearProviderList = () => {
    setProvidersLoading(true);
    if(selectedGeospaceId) {
      getAsnsForGeospace(selectedGeospaceId)
        .then(res => setProviders(res.results))
        .catch(err => handleError(err))
        .finally(() => setProvidersLoading(false));
    } else {
      getAsns()
        .then(res => setProviders(res.results))
        .catch(err => handleError(err))
        .finally(() => setProvidersLoading(false));
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrolling(true);
    setScrollPosition({clientX: e.clientX, scrollX: scrollPosition.scrollX});
  }

  const turnOffSlider = () => {
    setIsScrolling(false);
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    const {clientX, scrollX} = scrollPosition;
    if(isScrolling && !!sliderRef.current) {
      const scroll: number = scrollX + e.clientX - clientX;
      sliderRef.current.scrollLeft = scroll;
      setScrollPosition({scrollX: scroll, clientX: e.clientX});
    }
  }

  const openSpeedTypeMenu = () => openFilterMenu && openFilterMenu(filterTypes.SPEED);
  const openCalendarTypeMenu = () => openFilterMenu && openFilterMenu(filterTypes.CALENDAR);
  const openProviderMenu = () => openFilterMenu && openFilterMenu(filterTypes.PROVIDERS);

  return (
    <div style={styles.DropdownFiltersContainer(isSmallerThanMid, isInsideContainer)}
         id={'dropdown-filters--container'}
         className={`${isSmallerThanMid ? 'dropdown-filters--container-small' : ''}`}
         ref={sliderRef}
         onMouseDown={isSmallerThanMid ? handleMouseDown : undefined}
         onMouseUp={isSmallerThanMid ? turnOffSlider : undefined}
         onMouseMove={isSmallerThanMid ? handleMouseMove : undefined}
         draggable={true}
    >
      <DropdownFilter iconSrc={SpeedIcon}
                      options={speedFilters}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
                      changeFilter={changeSpeedFilter}
                      selectedFilter={speedType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
                      loading={false}
                      openFilterMenu={openSpeedTypeMenu}
      />
      { !isSmallerThanMid && <DropdownFilterVerticalDivider/> }
      <DropdownFilter iconSrc={CalendarIcon}
                      options={calendarFilters.includes((calendarType as string)) ? calendarFilters : [calendarType, ...calendarFilters]}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
                      changeFilter={changeCalendarFilter}
                      selectedFilter={calendarType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
                      lastOptionTriggersFunction
                      lastOptionOnClick={openDatePicker}
                      loading={false}
                      openFilterMenu={openCalendarTypeMenu}
      />
      { !isSmallerThanMid && <DropdownFilterVerticalDivider/> }
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
                      isLast
                      openFilterMenu={openProviderMenu}
      />
    </div>
  )
}

export default DropdownFilters;