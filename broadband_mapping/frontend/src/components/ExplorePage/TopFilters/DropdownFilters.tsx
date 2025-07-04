import React, {ChangeEvent, ReactElement, useContext, useEffect, useRef, useState} from "react";
import {styles} from "./styles/DropdownFilters.style";
import DropdownFilter from "./DropdownFilter";
import CalendarIcon from '../../../assets/calendar-icon.png';
import ProvidersIcon from '../../../assets/providers-icon.png';
import SpeedIcon from '../../../assets/speeds-icon.png';
import DropdownFilterVerticalDivider from "./DropdownFilterVerticalDivider";
import {CalendarFilters, FilterTypes, isCalendarFilterPresent, SpeedFilters} from "../../../utils/filters";
import {getAsns, getAsnsForGeospace} from "../../../api/asns/requests";
import {Asn} from "../../../api/asns/types";
import {handleError} from "../../../api";
import {Filter, Optional} from "../../../utils/types";
import {debounce} from "../../../api/utils/debouncer";
import {GeoJSONFilters} from "../../../api/geojson/types";
import {usePrev} from "../../../hooks/usePrev";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import './styles/DropdownFilters.css';
import AlertsContext, {SNACKBAR_TYPES} from "../../../context/AlertsContext";

type ScrollPosition = {
  clientX: number;
  scrollX: number;
}

interface DropdownFiltersProps {
  changeFilters: (filters: GeoJSONFilters) => void;
  speedType: string;
  calendarType: string;
  provider: Asn;
  openDatePicker: () => void;
  selectedGeospaceId?: string;
  isInsideContainer?: boolean;
  openFloatingFilter?: (filter: string) => void;
}

const DropdownFilters = ({
  changeFilters,
  speedType,
  calendarType,
  provider,
  openDatePicker,
  selectedGeospaceId,
  isInsideContainer,
  openFloatingFilter
}: DropdownFiltersProps): ReactElement => {
  const { showSnackbarMessage } = useContext(AlertsContext);
  const {isSmallScreen, isSmallTabletScreen, isLargeTabletScreen, isTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isTabletScreen;

  const [currentFilters, setCurrentFilters] = useState<GeoJSONFilters>({
    speedType: speedType,
    calendar: calendarType,
    provider: provider
  });
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
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        });
    } else {
      getAsns()
        .then(res => {
          setProviders(res.results);
        })
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        });
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
    setProvidersLoading(true);
    const value: string = e.target.value;
    if(selectedGeospaceId) {
       getAsnsForGeospace(selectedGeospaceId, value)
         .then(res => setProviders(res.results))
         .catch(err => {
           handleError(err);
           showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
         })
         .finally(() => setProvidersLoading(false));
    } else {
      getAsns(value)
        .then(res => setProviders(res.results))
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    }
  });

  const clearProviderList = () => {
    setProvidersLoading(true);
    if(selectedGeospaceId) {
      getAsnsForGeospace(selectedGeospaceId)
        .then(res => setProviders(res.results))
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
        .finally(() => setProvidersLoading(false));
    } else {
      getAsns()
        .then(res => setProviders(res.results))
        .catch(err => {
          handleError(err);
          showSnackbarMessage('An error has occurred while loading providers. Please try again later.', SNACKBAR_TYPES.ERROR);
        })
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

  const openSpeedTypeFloatingFilter = () => openFloatingFilter && openFloatingFilter(FilterTypes.SPEED);
  const openCalendarTypeFloatingFilter = () => openFloatingFilter && openFloatingFilter(FilterTypes.CALENDAR);
  const openProviderFloatingFilter = () => openFloatingFilter && openFloatingFilter(FilterTypes.PROVIDERS);

  return (
    <div style={styles.DropdownFiltersContainer(isSmallScreen, isSmallTabletScreen, isLargeTabletScreen, isInsideContainer)}
         id={'dropdown-filters--container'}
         className={`${isSmall ? 'dropdown-filters--container-small' : ''}`}
         ref={sliderRef}
         onMouseDown={isSmall ? handleMouseDown : undefined}
         onMouseUp={isSmall ? turnOffSlider : undefined}
         onMouseMove={isSmall ? handleMouseMove : undefined}
         draggable={true}
    >
      <DropdownFilter iconSrc={SpeedIcon}
                      options={Object.values(SpeedFilters)}
                      textWidth={'70px'}
                      type={FilterTypes.SPEED}
                      changeFilter={changeSpeedFilter}
                      selectedFilter={speedType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
                      loading={false}
                      openFloatingFilter={openSpeedTypeFloatingFilter}
                      shouldFloatLeft={isSmallTabletScreen && isInsideContainer}
      />
      { !isSmall && <DropdownFilterVerticalDivider/> }
      <DropdownFilter iconSrc={CalendarIcon}
                      options={isCalendarFilterPresent(calendarType as string) ? Object.values(CalendarFilters) : [calendarType, ...Object.values(CalendarFilters)]}
                      textWidth={isSmall && !isInsideContainer ? '90px' : '70px'}
                      type={FilterTypes.CALENDAR}
                      changeFilter={changeCalendarFilter}
                      selectedFilter={calendarType}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
                      lastOptionOnClick={openDatePicker}
                      loading={false}
                      openFloatingFilter={openCalendarTypeFloatingFilter}
      />
      { !isSmall && <DropdownFilterVerticalDivider/> }
      <DropdownFilter iconSrc={ProvidersIcon}
                      options={providers}
                      withSearchbar
                      textWidth={'85px'}
                      type={FilterTypes.PROVIDERS}
                      changeFilter={changeProviderFilter}
                      selectedFilter={provider}
                      searchbarOnChange={handleProviderSearchbarChange}
                      clearProviderList={clearProviderList}
                      setOpenFilter={setOpenFilter}
                      openFilter={openFilter}
                      loading={providersLoading}
                      isLast
                      openFloatingFilter={openProviderFloatingFilter}
      />
    </div>
  )
}

export default DropdownFilters;