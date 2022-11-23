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
  calendarFilters,
  generateFilterLabel,
  getCorrectNamespace, getDateQueryStringFromCalendarType,
  getZoomForNamespace,
  speedFilters,
  tabs
} from "../../utils/filters";
import {allProvidersElement} from "./TopFilters/utils/providers";
import {getValueFromUrl, updateUrl} from "../../utils/base64";
import {Asn} from "../../api/asns/types";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "../../utils/map";
import CustomMapOverlayingLoader from "../common/CustomMapOverlayingLoader";
import {emptyGeoJSONFilters, GeoJSONFilters} from "../../api/geojson/types";
import L from "leaflet";
import ExplorationPopoverIcon from "./ExplorationPopover/ExplorationPopoverIcon";
import {getGeospaces} from "../../api/namespaces/requests";
import DatePicker from "./DatePicker/DatePicker";
import {DateFilter, getInitialStateFromCalendarType, getQueryStringFromDateObject} from "../../utils/dates";
import {getFiltersString} from "../../api/utils/filters";
import * as amplitude from "@amplitude/analytics-browser";

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

  const [loading, setLoading] = useState(false);
  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!!getValueFromUrl('selectedGeospace') || !!getValueFromUrl('selectedGeospaceId'));
  const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);
  const [selectedGeospaceId, setSelectedGeospaceId] = useState(getGeospaceId());
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(getValueFromUrl('selectedGeospace') ?? null);
  const [geospaceNamespace, setGeospaceNamespace] = useState(getValueFromUrl('geospaceNamespace') ?? tabs.COUNTIES);
  const [speedType, setSpeedType] = useState<string>(getValueFromUrl('speedType') ?? speedFilters.DOWNLOAD);
  const [calendarType, setCalendarType] = useState<string>(getValueFromUrl('calendarType') ?? calendarFilters.THIS_YEAR);
  const [provider, setProvider] = useState<Asn>(getValueFromUrl('provider') ?? allProvidersElement);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<string>>(getValueFromUrl('selectedSpeedFilters') ?? [speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);
  const [currentMapZoom, setCurrentMapZoom] = useState(getValueFromUrl('zoom') ?? 3)
  const [currentMapCenter, setCurrentMapCenter] = useState<Array<number>>(getValueFromUrl('center') ?? [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateQueryString, setDateQueryString] = useState(getValueFromUrl('calendarType') ? getDateQueryStringFromCalendarType(getValueFromUrl('calendarType')) : getDateQueryStringFromCalendarType(calendarFilters.THIS_YEAR));

  useEffect(() => {
    if(REACT_APP_ENV === 'production') {
      amplitude.init(AMPLITUDE_KEY);
      amplitude.track('Page visited');
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
    selectedGeospaceId
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
      openRightPanel();
      setLoading(false);
    } catch (e: any) {
      handleError(e);
    }
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
    openRightPanel();
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
    closeDatePicker();
  }

  const handleSetCalendarType = (calendarType: Filter) => {
    setCalendarType(calendarType as string);
    setDateQueryString(getDateQueryStringFromCalendarType(calendarType as string));
  }

  return (
    <div style={styles.ExplorePageContainer}>
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
      <TopSearchbar selectSuggestion={selectSuggestion}/>
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
      <SpeedFilters isRightPanelOpen={isRightPanelOpen && !isRightPanelHidden}
                    speedType={speedType}
                    selectedSpeedFilters={selectedSpeedFilters}
                    setSelectedSpeedFilters={setSelectedSpeedFilters}
      />
      <ExplorationPopover closePopover={closePopover}
                          selectGeospace={selectGeospace}
                          setGeospaceNamespace={setGeospaceNamespace}
                          recenterMap={recenterMap}
                          setCenter={setCurrentMapCenter}
                          setZoom={setCurrentMapZoom}
                          isOpen={isExplorationPopoverOpen}
                          setIsOpen={setIsExplorationPopoverOpen}
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
      {
        isDatePickerOpen &&
        <DatePicker closeDatePicker={closeDatePicker}
                    applyRanges={handleApplyRanges}
                    initialState={getInitialStateFromCalendarType(calendarType as string)}
        />
      }
    </div>
  )
}

export default ExplorePage;