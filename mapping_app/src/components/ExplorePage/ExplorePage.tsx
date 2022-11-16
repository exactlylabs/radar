import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorePage.style";
import MyMap from "./MyMap";
import ExplorationPopover from "./ExplorationPopover/ExplorationPopover";
import TopSearchbar from "./TopSearchbar/TopSearchbar";
import TopFilters from "./TopFilters/TopFilters";
import SpeedFilters from "./SpeedFilters/SpeedFilters";
import RightPanel from "./RightPanel/RightPanel";
import {AppState, Filter, Optional} from "../../utils/types";
import {Geospace, GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {getOverview} from "../../api/geospaces/requests";
import {handleError} from "../../api";
import {speedTypes} from "../../utils/speeds";
import {
  calendarFilters,
  filterTypes,
  generateFilterLabel,
  getCorrectNamespace,
  getDateQueryStringFromCalendarType,
  getFilterMenuContentFromFilter,
  getZoomForNamespace,
  speedFilters,
  tabs
} from "../../utils/filters";
import {allProvidersElement} from "./TopFilters/utils/providers";
import {getValueFromUrl, updateUrl} from "../../utils/base64";
import {Asn} from "../../api/asns/types";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "../../utils/map";
import MyOverlayingLoader from "../common/MyOverlayingLoader";
import L from "leaflet";
import DatePicker from "./DatePicker/DatePicker";
import {getInitialStateFromCalendarType} from "../../utils/dates";
import {getFiltersString} from "../../api/utils/filters";
import * as amplitude from "@amplitude/analytics-browser";
import {hasVisitedAllResults, setAlreadyVisitedCookie} from "../../utils/cookies";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import FirstTimeModal from "./FirstTimeModal/FirstTimeModal";
import SmallScreenBottomNavigator from "./SmallScreenBottomNavigator/SmallScreenBottomNavigator";
import DropdownFilters from "./TopFilters/DropdownFilters";
import MyGenericMenu from "../common/MyGenericMenu/MyGenericMenu";
import {MenuContent} from "../common/MyGenericMenu/menu";
import {useContentMenu} from "../../hooks/useContentMenu";
import MenuContentGeospace from "../common/MyGenericMenu/MenuContentGeospace/MenuContentGeospace";
import MenuContentFullGeospace from "../common/MyGenericMenu/MenuContentFullGeospace/MenuContentFullGeospace";
import MenuContentProviders from "../common/MyGenericMenu/MenuContentProviders/MenuContentProviders";
import MenuContentCalendar from "../common/MyGenericMenu/MenuContentCalendar/MenuContentCalendar";
import MenuContentSpeedType from "../common/MyGenericMenu/MenuContentSpeedType/MenuContentSpeedType";
import MenuContentCustomDateRange from "../common/MyGenericMenu/MenuContentCustomRange/MenuContentCustomDateRange";
import MyGenericModal from "../common/MyGenericModal/MyGenericModal";
import ModalContentGeospace from "../common/MyGenericModal/ModalContentGeospace/ModalContentGeospace";
import ModalContentFullGeospace from "../common/MyGenericModal/ModalContentFullGeospace/ModalContentFullGeospace";
import ModalContentSpeedType from "../common/MyGenericModal/ModalContentSpeedType/ModalContentSpeedType";
import ModalContentProviders from "../common/MyGenericModal/ModalContentProviders/ModalContentProviders";
import ModalContentCustomDateRange
  from "../common/MyGenericModal/ModalContentCustomDateRange/ModalContentCustomDateRange";
import ModalContentCalendar from "../common/MyGenericModal/ModalContentCalendar/ModalContentCalendar";

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

  const {isSmallScreen, isSmallTabletScreen, isTabletScreen} = useViewportSizes();
  const isSmallExplorePage = isSmallScreen || isTabletScreen;
  const {menuContent, setMenuContent} = useContentMenu();

  const [loading, setLoading] = useState(false);
  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(getValueFromUrl('isExplorationPopoverOpen') ?? !isSmallScreen); // if small screen, closed by default
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!(isSmallScreen || isSmallTabletScreen) && (!!getValueFromUrl('selectedGeospace') || !!getValueFromUrl('selectedGeospaceId')));
  const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);
  const [selectedGeospaceId, setSelectedGeospaceId] = useState(getGeospaceId());
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(getValueFromUrl('selectedGeospace') ?? null);
  const [geospaceNamespace, setGeospaceNamespace] = useState(getValueFromUrl('geospaceNamespace') ?? tabs.COUNTIES);
  const [speedType, setSpeedType] = useState<Filter>(getValueFromUrl('speedType') ?? speedFilters[0]);
  const [calendarType, setCalendarType] = useState<Filter>(getValueFromUrl('calendarType') ?? calendarFilters[3]);
  const [provider, setProvider] = useState<Filter>(getValueFromUrl('provider') ?? allProvidersElement);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<Filter>>(getValueFromUrl('selectedSpeedFilters') ?? [speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);
  const [currentMapZoom, setCurrentMapZoom] = useState(getValueFromUrl('zoom') ?? 3)
  const [currentMapCenter, setCurrentMapCenter] = useState<Array<number>>(getValueFromUrl('center') ?? [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateQueryString, setDateQueryString] = useState(getValueFromUrl('calendarType') ? getDateQueryStringFromCalendarType(getValueFromUrl('calendarType')) : getDateQueryStringFromCalendarType(calendarFilters[3]));
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [areSpeedFiltersOpen, setAreSpeedFiltersOpen] = useState(getValueFromUrl('areSpeedFiltersOpen') ?? false);
  const [areSmallScreenFiltersOpen, setAreSmallScreenFiltersOpen] = useState(true);
  const [genericMenuOpen, setGenericMenuOpen] = useState(false);
  const [genericModalOpen, setGenericModalOpen] = useState(false);

  const shouldDisplaySmallScreenBottomNavigator = (isSmallScreen && !isExplorationPopoverOpen) || isTabletScreen;

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
      const filtersString: string = getFiltersString([provider, calendarType]);
      getOverview(selectedGeospaceId, filtersString)
        .then(res => { setSelectedGeospace(res); })
        .catch(err => handleError(err));
    } else {
      setSelectedGeospace(null);
    }
  }, [selectedGeospaceId]);

  useEffect(() => {
    if(userCenter) {
      setGeospaceNamespace(tabs.COUNTIES);
      setCurrentMapCenter(userCenter);
      setCurrentMapZoom(getZoomForNamespace(tabs.COUNTIES));
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

  const selectSuggestion = async (suggestion: Geospace) => {
    try {
      setLoading(true);
      setGeospaceNamespace(getCorrectNamespace(suggestion.namespace));
      setCurrentMapCenter([suggestion.centroid[0], suggestion.centroid[1]]);
      setCurrentMapZoom(getZoomForNamespace(suggestion.namespace));
      const overview: GeospaceOverview = await getOverview(suggestion.id, '');
      const allData: GeospaceInfo = {
        ...overview,
        ...suggestion,
      };
      setSelectedGeospace(allData);
      setSelectedGeospaceId(allData.geospace.id);
      if(isSmallScreen) {
        openFullMenu();
      } else if(isSmallTabletScreen) {
        openFullModal();
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

  const openFullModal = () => {
    setGenericModalOpen(true);
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
    if(isSmallScreen) {
      setMenuContent(MenuContent.GEOSPACE);
      setGenericMenuOpen(true);
    } else if(isSmallTabletScreen) {
      setMenuContent(MenuContent.GEOSPACE);
      setGenericModalOpen(true);
    } else {
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

  const handleApplyRanges = (queryString: string) => {
    setCalendarType(generateFilterLabel(queryString));
    setDateQueryString(queryString);
    if(isSmallScreen) closeMenu();
    else closeDatePicker();
  }

  const handleSetCalendarType = (calendarType: Filter) => {
    setCalendarType(calendarType);
    setDateQueryString(getDateQueryStringFromCalendarType(calendarType as string));
  }

  const closeFirstTimeModal = () => setIsFirstTimeModalOpen(false);

  const handleToggleExplorationPopover = (value: boolean) => {
    if(isSmallScreen && areSpeedFiltersOpen) setAreSpeedFiltersOpen(false);
    setIsExplorationPopoverOpen(value);
  }

  const toggleSmallScreenFilters = () => {
    setAreSmallScreenFiltersOpen(!areSmallScreenFiltersOpen);
  }

  const handleChangeFilters = (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    handleSetCalendarType(filters[1]);
    setProvider(filters[2]);
  }

  const closeMenu = () => {
    setMenuContent(null);
    setGenericMenuOpen(false);
    setSelectedGeospace(null);
    setSelectedGeospaceId(null);
  }

  const closeModal = () => {
    setMenuContent(null);
    setGenericModalOpen(false);
    setSelectedGeospace(null);
    setSelectedGeospaceId(null);
  }

  const openFilterMenu = (filter: string) => {
    setGenericMenuOpen(true);
    setMenuContent(getFilterMenuContentFromFilter(filter));
  }

  const openFilterModal = (filter: string) => {
    setGenericModalOpen(true);
    setMenuContent(getFilterMenuContentFromFilter(filter));
  }

  const getContentForMenu = () => {
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
                               setSelectedOption={(option: string) => handleChangeFilters([speedType, option, provider])}
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
                                setSelectedOption={(option: Asn) => handleChangeFilters([speedType, calendarType, option])}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.SPEED_TYPE:
        return (
          <MenuContentSpeedType selectedOption={speedType as string}
                                setSelectedOption={(option: string) => handleChangeFilters([option, calendarType, provider])}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <MenuContentCustomDateRange goBack={() => openFilterMenu(filterTypes.CALENDAR)}
                                      applyRanges={handleApplyRanges}
                                      initialState={getInitialStateFromCalendarType(calendarType as string)}
          />
        )
      default:
        return null;
    }
  }

  const getContentForModal = () => {
    switch (menuContent) {
      case MenuContent.GEOSPACE:
        return (
          <ModalContentGeospace geospace={selectedGeospace as GeospaceOverview}
                                openFullModal={openFullModal}
                                speedType={speedType as string}
          />
        );
      case MenuContent.FULL_GEOSPACE:
        return (
          <ModalContentFullGeospace geospace={selectedGeospace as GeospaceOverview}
                                    applyRanges={handleApplyRanges}
                                    loading={loading}
                                    setLoading={setLoading}
                                    speedType={speedType}
                                    setSpeedType={setSpeedType}
                                    calendarType={calendarType}
                                    setCalendarType={setCalendarType}
                                    provider={provider}
                                    setProvider={setProvider}
                                    setSelectedGeoSpaceInfo={setSelectedGeoSpaceInfo}/>
        );
      case MenuContent.SPEED_TYPE:
        return (
          <ModalContentSpeedType selectedOption={speedType as string}
                                 setSelectedOption={(option: string) => handleChangeFilters([option, calendarType, provider])}
                                 closeModal={closeModal}
          />
        );
      case MenuContent.PROVIDERS:
        return (
          <ModalContentProviders geospaceId={selectedGeospaceId}
                                 selectedOption={provider as Asn}
                                 setSelectedOption={(option: Asn) => handleChangeFilters([speedType, calendarType, option])}
                                 closeModal={closeModal}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <ModalContentCustomDateRange goBack={() => openFilterModal(filterTypes.CALENDAR)}
                                       applyRanges={handleApplyRanges}
                                       initialState={getInitialStateFromCalendarType(calendarType as string)}
                                       closeModal={closeModal}
          />
        );
      case MenuContent.CALENDAR:
        return (
          <ModalContentCalendar selectedOption={calendarType as string}
                               setSelectedOption={(option: string) => handleChangeFilters([speedType, option, provider])}
                               closeModal={closeModal}
                               applyRanges={handleApplyRanges}
                               initialState={getInitialStateFromCalendarType(calendarType as string)}
                               setModalContent={setMenuContent}
          />
        );
    }
  }

  const getCurrentContent = () => {
    return isSmallTabletScreen ? getContentForModal() : getContentForMenu();
  }

  return (
    <div style={styles.ExplorePageContainer(isSmallExplorePage)}>
      { loading && <MyOverlayingLoader/> }
      <MyMap namespace={geospaceNamespace}
             selectedGeospace={selectedGeospace}
             selectGeospace={selectGeospace}
             speedType={speedType}
             provider={provider}
             selectedSpeedFilters={selectedSpeedFilters}
             initialZoom={currentMapZoom}
             setZoom={setCurrentMapZoom}
             initialCenter={currentMapCenter}
             setCenter={setCurrentMapCenter}
             setLoading={setLoading}
             isRightPanelHidden={isRightPanelHidden}
             dateQueryString={dateQueryString}
      />
      <TopSearchbar selectSuggestion={selectSuggestion}
                    toggleFilters={toggleSmallScreenFilters}
                    areSmallFiltersOpen={areSmallScreenFiltersOpen}
      />
      { isSmallExplorePage && areSmallScreenFiltersOpen &&
        <DropdownFilters calendarType={calendarType}
                         provider={provider}
                         speedType={speedType}
                         openDatePicker={openDatePicker}
                         selectedGeospaceId={selectedGeospaceId}
                         changeFilters={handleChangeFilters}
                         openFloatingFilter={isSmallScreen ? openFilterMenu : openFilterModal}
        />
      }
      { !isSmallExplorePage &&
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
      { !isSmallExplorePage &&
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
      { isFirstTimeModalOpen && isSmallScreen &&
        <FirstTimeModal closeModal={closeFirstTimeModal}/>
      }
      { shouldDisplaySmallScreenBottomNavigator &&
        <SmallScreenBottomNavigator geospaceNamespace={geospaceNamespace}
                                    setGeospaceNamespace={setGeospaceNamespace}
                                    areSpeedFiltersOpen={areSpeedFiltersOpen}
                                    setAreSpeedFiltersOpen={setAreSpeedFiltersOpen}
                                    speedType={speedType as string}
                                    selectedSpeedFilters={selectedSpeedFilters}
                                    setSelectedSpeedFilters={setSelectedSpeedFilters}
        />
      }
      { isSmallScreen && genericMenuOpen &&
        <MyGenericMenu closeMenu={closeMenu}>
          {getCurrentContent()}
        </MyGenericMenu>
      }
      {
        isSmallTabletScreen && genericModalOpen &&
        <MyGenericModal closeModal={closeModal}>
          {getCurrentContent()}
        </MyGenericModal>
      }
    </div>
  )
}

export default ExplorePage;