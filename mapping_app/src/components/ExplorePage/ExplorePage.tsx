import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorePage.style";
import Map from "./Map";
import ExplorationPopover from "./ExplorationPopover/ExplorationPopover";
import TopSearchbar from "./TopSearchbar/TopSearchbar";
import TopFilters from "./TopFilters/TopFilters";
import SpeedFilters from "./SpeedFilters/SpeedFilters";
import RightPanel from "./RightPanel/RightPanel";
import {AppState, Filter, Optional} from "../../utils/types";
import {DetailedGeospace, GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {getOverview} from "../../api/geospaces/requests";
import {handleError} from "../../api";
import {speedTypes} from "../../utils/speeds";
import {
  CalendarFilters,
  generateFilterLabel,
  getCorrectNamespace,
  getDateQueryStringFromCalendarType,
  getZoomForNamespace,
  SpeedFilters as SF,
  GeospacesTabs,
  FilterTypes,
  getFilterMenuContentFromFilter,
} from "../../utils/filters";
import {allProvidersElement} from "./TopFilters/utils/providers";
import {getValueFromUrl, updateUrl} from "../../utils/base64";
import {Asn} from "../../api/asns/types";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "../../utils/map";
import CustomMapOverlayingLoader from "../common/CustomMapOverlayingLoader";
import {emptyGeoJSONFilters, GeoJSONFilters} from "../../api/geojson/types";
import L from "leaflet";
import DatePicker from "./DatePicker/DatePicker";
import {DateFilter, getInitialStateFromCalendarType, getQueryStringFromDateObject} from "../../utils/dates";
import * as amplitude from "@amplitude/analytics-browser";
import {hasVisitedAllResults, setAlreadyVisitedCookie} from "../../utils/cookies";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import FirstTimeModal from "./FirstTimeModal/FirstTimeModal";
import SmallScreenBottomNavigator from "./SmallScreenBottomNavigator/SmallScreenBottomNavigator";
import DropdownFilters from "./TopFilters/DropdownFilters";
import CustomGenericMenu from "../common/CustomGenericMenu/CustomGenericMenu";
import {MenuContent} from "../common/CustomGenericMenu/menu";
import {useContentMenu} from "../../hooks/useContentMenu";
import MenuContentGeospace from "../common/CustomGenericMenu/MenuContentGeospace/MenuContentGeospace";
import MenuContentFullGeospace from "../common/CustomGenericMenu/MenuContentFullGeospace/MenuContentFullGeospace";
import MenuContentProviders from "../common/CustomGenericMenu/MenuContentProviders/MenuContentProviders";
import MenuContentCalendar from "../common/CustomGenericMenu/MenuContentCalendar/MenuContentCalendar";
import MenuContentSpeedType from "../common/CustomGenericMenu/MenuContentSpeedType/MenuContentSpeedType";
import MenuContentCustomDateRange from "../common/CustomGenericMenu/MenuContentCustomRange/MenuContentCustomDateRange";

interface ExplorePageProps {
  userCenter: Optional<Array<number>>;
}

const ExplorePage = ({userCenter}: ExplorePageProps): ReactElement => {

  const getGeospaceId = () => {
    const possibleId = getValueFromUrl('selectedGeospaceId');
    if(possibleId) return possibleId;
    const possibleGeospace = getValueFromUrl('selectedGeospace');
    if(!possibleGeospace) return null;
    return (possibleGeospace as GeospaceOverview).geospace.id;
  }

  const {isSmallerThanMid} = useViewportSizes();
  const {menuContent, setMenuContent} = useContentMenu();

  const [loading, setLoading] = useState(false);
  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(getValueFromUrl('isExplorationPopoverOpen') ?? !isSmallerThanMid); // if small screen, closed by default
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isSmallerThanMid && (!!getValueFromUrl('selectedGeospace') || !!getValueFromUrl('selectedGeospaceId')));
  const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);
  const [selectedGeospaceId, setSelectedGeospaceId] = useState(getGeospaceId());
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(getValueFromUrl('selectedGeospace') ?? null);
  const [geospaceNamespace, setGeospaceNamespace] = useState(getValueFromUrl('geospaceNamespace') ?? GeospacesTabs.COUNTIES);
  const [speedType, setSpeedType] = useState<string>(getValueFromUrl('speedType') ?? SF.DOWNLOAD);
  const [calendarType, setCalendarType] = useState<string>(getValueFromUrl('calendarType') ?? CalendarFilters.THIS_YEAR);
  const [provider, setProvider] = useState<Asn>(getValueFromUrl('provider') ?? allProvidersElement);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<string>>(getValueFromUrl('selectedSpeedFilters') ?? [speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);
  const [currentMapZoom, setCurrentMapZoom] = useState(getValueFromUrl('zoom') ?? 3)
  const [currentMapCenter, setCurrentMapCenter] = useState<Array<number>>(getValueFromUrl('center') ?? [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateQueryString, setDateQueryString] = useState(getValueFromUrl('calendarType') ? getDateQueryStringFromCalendarType(getValueFromUrl('calendarType')) : getDateQueryStringFromCalendarType(CalendarFilters.THIS_YEAR));
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [areSpeedFiltersOpen, setAreSpeedFiltersOpen] = useState(getValueFromUrl('areSpeedFiltersOpen') ?? false);
  const [areSmallScreenFiltersOpen, setAreSmallScreenFiltersOpen] = useState(true);
  const [genericMenuOpen, setGenericMenuOpen] = useState(false);

  useEffect(() => {
    if(REACT_APP_ENV === 'production') {
      amplitude.init(AMPLITUDE_KEY);
      amplitude.track('Page visited');
    }
    if(!hasVisitedAllResults()) {
      setIsFirstTimeModalOpen(true);
      setAlreadyVisitedCookie();
    }
  }, []);

  useEffect(() => {
    const currentState: AppState = {
      geospaceNamespace,
      speedType,
      calendarType,
      provider,
      selectedGeospace,
      selectedSpeedFilters,
      zoom: currentMapZoom,
      center: currentMapCenter,
      selectedGeospaceId,
      isExplorationPopoverOpen,
      areSpeedFiltersOpen
    };
    updateUrl(currentState);
  }, [
    geospaceNamespace,
    speedType,
    calendarType,
    (provider as Asn).id,
    selectedGeospace,
    selectedSpeedFilters,
    currentMapZoom,
    currentMapCenter,
    selectedGeospaceId,
    isExplorationPopoverOpen,
    areSpeedFiltersOpen
  ]);

  useEffect(() => {
    if(selectedGeospaceId) {
      const filters: GeoJSONFilters = {
        speedType,
        provider,
        calendar: calendarType,
      }
      getOverview(selectedGeospaceId, filters)
        .then(res => { setSelectedGeospace(res); })
        .catch(err => handleError(err));
    } else {
      setSelectedGeospace(null);
    }
  }, [selectedGeospaceId]);

  useEffect(() => {
    if(userCenter) {
      setGeospaceNamespace(GeospacesTabs.COUNTIES);
      setCurrentMapCenter(userCenter);
      setCurrentMapZoom(getZoomForNamespace(GeospacesTabs.COUNTIES));
    }
  }, [userCenter]);

  useEffect(() => {
    if(userCenter) {
      setGeospaceNamespace(GeospacesTabs.COUNTIES);
      setCurrentMapCenter(userCenter);
      setCurrentMapZoom(getZoomForNamespace(GeospacesTabs.COUNTIES));
    }
  }, [userCenter]);

  const closePopover = () => setIsExplorationPopoverOpen(false);

  const openRightPanel = () => {
    setIsRightPanelHidden(false);
    setIsRightPanelOpen(true);
  }

  const closeRightPanel = () => {
    setSelectedGeospace(null);
    setSelectedGeospaceId(null);
    setIsRightPanelOpen(false);
  }

  const hidePanel = () => setIsRightPanelHidden(true);
  const showPanel = () => setIsRightPanelHidden(false);
  const togglePanel = () => isRightPanelHidden ? showPanel() : hidePanel();

  const selectSuggestion = async (suggestion: DetailedGeospace) => {
    try {
      setLoading(true);
      const overview: GeospaceOverview = await getOverview(suggestion.id, emptyGeoJSONFilters);
      setGeospaceNamespace(getCorrectNamespace(suggestion.namespace));
      setCurrentMapCenter([suggestion.centroid[0], suggestion.centroid[1]]);
      setCurrentMapZoom(getZoomForNamespace(suggestion.namespace));
      const allData: GeospaceInfo = {
        ...overview,
        ...suggestion,
      };
      setSelectedGeospace(allData);
      setSelectedGeospaceId(allData.geospace.id);
      if(isSmallerThanMid) {
        openFullMenu();
      } else {
        openRightPanel();
      }
      setLoading(false);
    } catch (e: any) {
      handleError(e);
    }
  }

  const openFullMenu = () => {
    setGenericMenuOpen(true);
    setAreSmallScreenFiltersOpen(false);
    setMenuContent(MenuContent.FULL_GEOSPACE);
  }

  const setSelectedGeoSpaceInfo = (geospaceInfo: GeospaceInfo) => {
    setLoading(true);
    setSelectedGeospace(geospaceInfo);
    setSelectedGeospaceId((geospaceInfo as GeospaceOverview).geospace.id);
    setLoading(false);
  }

  const selectGeospace = (geospace: GeospaceInfo, center?: L.LatLng) => {
    setLoading(true);
    setSelectedGeospace(geospace);
    setSelectedGeospaceId((geospace as GeospaceOverview).geospace.id);
    if(center) {
      setCurrentMapCenter([center.lat, center.lng]);
      setCurrentMapZoom(getZoomForNamespace((geospace as GeospaceOverview).geospace.namespace));
    } else if((geospace as GeospaceOverview).geospace.centroid) {
      const centroid: Array<number> = (geospace as GeospaceOverview).geospace.centroid;
      setCurrentMapCenter([centroid[0], centroid[1]]);
      setCurrentMapZoom(getZoomForNamespace((geospace as GeospaceOverview).geospace.namespace));
    }
    if(isSmallerThanMid) {
      setMenuContent(MenuContent.GEOSPACE);
      setGenericMenuOpen(true);
    } else if(!isSmallerThanMid){
      openRightPanel();
    }
    setLoading(false);
  }

  const recenterMap = () => {
    setCurrentMapCenter([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
    setCurrentMapZoom(3);
  }

  const openDatePicker = () => setIsDatePickerOpen(true);
  const closeDatePicker = () => setIsDatePickerOpen(false);

  const handleApplyRanges = (dateObject: DateFilter) => {
    setCalendarType(generateFilterLabel(dateObject));
    setDateQueryString(getQueryStringFromDateObject(dateObject));
    if(isSmallerThanMid) closeMenu();
    else closeDatePicker();
  }

  const handleSetCalendarType = (calendarType: Filter) => {
    setCalendarType(calendarType as string);
    setDateQueryString(getDateQueryStringFromCalendarType(calendarType as string));
  }

  const closeFirstTimeModal = () => setIsFirstTimeModalOpen(false);

  const handleToggleExplorationPopover = (value: boolean) => {
    if(isSmallerThanMid && areSpeedFiltersOpen) setAreSpeedFiltersOpen(false);
    setIsExplorationPopoverOpen(value);
  }

  const toggleSmallScreenFilters = () => {
    setAreSmallScreenFiltersOpen(!areSmallScreenFiltersOpen);
  }

  const handleChangeFilters = (filters: GeoJSONFilters) => {
    setSpeedType(filters.speedType);
    setCalendarType(filters.calendar);
    setProvider(filters.provider);
  }

  const closeMenu = () => {
    setMenuContent(null);
    setGenericMenuOpen(false);
  }

  const openFilterMenu = (filter: string) => {
    setGenericMenuOpen(true);
    setMenuContent(getFilterMenuContentFromFilter(filter));
  }

  const getCurrentContent = () => {
    switch (menuContent) {
      case MenuContent.GEOSPACE:
        return (
          <MenuContentGeospace geospace={selectedGeospace as GeospaceOverview}
                               speedType={speedType as string}
                               openFullMenu={openFullMenu}
        />);
      case MenuContent.FULL_GEOSPACE:
        return (
          <MenuContentFullGeospace geospace={selectedGeospace as GeospaceOverview}
                                   applyRanges={handleApplyRanges}
                                   loading={loading}
                                   setLoading={setLoading}
                                   speedType={speedType}
                                   setSpeedType={setSpeedType}
                                   calendarType={calendarType}
                                   setCalendarType={setCalendarType}
                                   provider={provider}
                                   setProvider={setProvider}
                                   setSelectedGeoSpaceInfo={setSelectedGeoSpaceInfo}
          />
        );
      case MenuContent.CALENDAR:
        return (
          <MenuContentCalendar selectedOption={calendarType as string}
                               setSelectedOption={(option: string) => handleChangeFilters({speedType, calendar: option, provider})}
                               closeMenu={closeMenu}
                               applyRanges={handleApplyRanges}
                               initialState={getInitialStateFromCalendarType(calendarType as string)}
                               setMenuContent={setMenuContent}
          />
        );
      case MenuContent.PROVIDERS:
        return (
          <MenuContentProviders geospaceId={selectedGeospaceId}
                                selectedOption={provider as Asn}
                                setSelectedOption={(option: Asn) => handleChangeFilters({speedType, calendar: calendarType, provider: option})}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.SPEED_TYPE:
        return (
          <MenuContentSpeedType selectedOption={speedType as string}
                                setSelectedOption={(option: string) => handleChangeFilters({speedType: option, calendar: calendarType, provider})}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <MenuContentCustomDateRange goBack={() => openFilterMenu(FilterTypes.CALENDAR)}
                                      applyRanges={handleApplyRanges}
                                      initialState={getInitialStateFromCalendarType(calendarType as string)}
          />
        )
      default:
        return null;
    }
  }

  return (
    <div style={styles.ExplorePageContainer(isSmallerThanMid)}>
      { loading && <CustomMapOverlayingLoader/> }
      <Map namespace={geospaceNamespace}
           selectedGeospace={selectedGeospace}
           selectGeospace={selectGeospace}
           speedType={speedType}
           provider={provider}
           calendarType={calendarType}
           selectedSpeedFilters={selectedSpeedFilters}
           initialZoom={currentMapZoom}
           setZoom={setCurrentMapZoom}
           initialCenter={currentMapCenter}
           setCenter={setCurrentMapCenter}
           setLoading={setLoading}
           isRightPanelHidden={isRightPanelHidden}
      />
      <TopSearchbar selectSuggestion={selectSuggestion}
                    toggleFilters={toggleSmallScreenFilters}
                    areSmallFiltersOpen={areSmallScreenFiltersOpen}
      />
      { isSmallerThanMid && areSmallScreenFiltersOpen &&
        <DropdownFilters calendarType={calendarType}
                         provider={provider}
                         speedType={speedType}
                         openDatePicker={openDatePicker}
                         selectedGeospaceId={selectedGeospaceId}
                         changeFilters={handleChangeFilters}
                         openFilterMenu={openFilterMenu}
        />
      }
      {!isSmallerThanMid &&
        <TopFilters isRightPanelOpen={isRightPanelOpen && !isRightPanelHidden}
                    setGeospaceNamespace={setGeospaceNamespace}
                    setSpeedType={setSpeedType}
                    setCalendarType={handleSetCalendarType}
                    setProvider={setProvider}
                    geospaceNamespace={geospaceNamespace}
                    speedType={speedType}
                    calendarType={calendarType}
                    provider={provider}
                    openDatePicker={openDatePicker}
                    isRightPanelHidden={isRightPanelHidden}
        />
      }
      { !isSmallerThanMid &&
        <SpeedFilters isRightPanelOpen={isRightPanelOpen && !isRightPanelHidden}
                      speedType={speedType}
                      selectedSpeedFilters={selectedSpeedFilters}
                      setSelectedSpeedFilters={setSelectedSpeedFilters}
        />
      }
      <ExplorationPopover closePopover={closePopover}
                          selectGeospace={selectGeospace}
                          setGeospaceNamespace={setGeospaceNamespace}
                          recenterMap={recenterMap}
                          setCenter={setCurrentMapCenter}
                          setZoom={setCurrentMapZoom}
                          isOpen={isExplorationPopoverOpen}
                          setIsOpen={handleToggleExplorationPopover}
      />
      { isRightPanelOpen && selectedGeospace &&
        <RightPanel closePanel={closeRightPanel}
                    selectedGeospaceInfo={selectedGeospace}
                    setSelectedGeoSpaceInfo={setSelectedGeospace}
                    speedType={speedType}
                    setSpeedType={setSpeedType}
                    calendarType={calendarType}
                    setCalendarType={handleSetCalendarType}
                    provider={provider}
                    setProvider={setProvider}
                    toggleHidden={togglePanel}
                    isHidden={isRightPanelHidden}
                    openDatePicker={openDatePicker}
                    loading={loading}
        />
      }
      { isDatePickerOpen &&
        <DatePicker closeDatePicker={closeDatePicker}
                    applyRanges={handleApplyRanges}
                    initialState={getInitialStateFromCalendarType(calendarType as string)}
        />
      }
      { isFirstTimeModalOpen && isSmallerThanMid &&
        <FirstTimeModal closeModal={closeFirstTimeModal}/>
      }
      { isSmallerThanMid && !isExplorationPopoverOpen &&
        <SmallScreenBottomNavigator geospaceNamespace={geospaceNamespace}
                                    setGeospaceNamespace={setGeospaceNamespace}
                                    areSpeedFiltersOpen={areSpeedFiltersOpen}
                                    setAreSpeedFiltersOpen={setAreSpeedFiltersOpen}
                                    speedType={speedType as string}
                                    selectedSpeedFilters={selectedSpeedFilters}
                                    setSelectedSpeedFilters={setSelectedSpeedFilters}
        />
      }
      { isSmallerThanMid && genericMenuOpen &&
        <CustomGenericMenu closeMenu={closeMenu}>
          {getCurrentContent()}
        </CustomGenericMenu>
      }
    </div>
  )
}

export default ExplorePage;