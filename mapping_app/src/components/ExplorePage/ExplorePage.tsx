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
import {calendarFilters, getCorrectNamespace, getZoomForNamespace, speedFilters, tabs} from "../../utils/filters";
import {allProvidersElement} from "./TopFilters/utils/providers";
import {getValueFromUrl, updateUrl} from "../../utils/base64";
import {Asn} from "../../api/asns/types";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "../../utils/map";
import MyOverlayingLoader from "../common/MyOverlayingLoader";
import L from "leaflet";
import ExplorationPopoverIcon from "./ExplorationPopover/ExplorationPopoverIcon";
import DatePicker from "./DatePicker/DatePicker";

interface ExplorePageProps {
  userCenter: Optional<Array<number>>;
}

const ExplorePage = ({userCenter}: ExplorePageProps): ReactElement => {

  const [loading, setLoading] = useState(false);
  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!!getValueFromUrl('selectedGeospace'));
  const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(getValueFromUrl('selectedGeospace') ?? null);
  const [geospaceNamespace, setGeospaceNamespace] = useState(getValueFromUrl('geospaceNamespace') ?? tabs.STATES);
  const [speedType, setSpeedType] = useState<Filter>(getValueFromUrl('speedType') ?? speedFilters[0]);
  const [calendarType, setCalendarType] = useState<Filter>(getValueFromUrl('calendarType') ?? calendarFilters[3]);
  const [provider, setProvider] = useState<Filter>(getValueFromUrl('provider') ?? allProvidersElement);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<Filter>>(getValueFromUrl('selectedSpeedFilters') ?? [speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);
  const [currentMapZoom, setCurrentMapZoom] = useState(getValueFromUrl('zoom') ?? 3)
  const [currentMapCenter, setCurrentMapCenter] = useState<Array<number>>(getValueFromUrl('center') ?? [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);

  useEffect(() => {
    const currentState: AppState = {
      geospaceNamespace,
      speedType,
      calendarType,
      provider,
      selectedGeospace,
      selectedSpeedFilters,
      zoom: currentMapZoom,
      center: currentMapCenter
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
    currentMapCenter
  ]);

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
    setIsRightPanelOpen(false);
  }

  const hidePanel = () => setIsRightPanelHidden(true);
  const showPanel = () => setIsRightPanelHidden(false);
  const togglePanel = () => isRightPanelHidden ? showPanel() : hidePanel();

  const selectSuggestion = async (suggestion: Geospace) => {
    try {
      setLoading(true);
      setGeospaceNamespace(getCorrectNamespace(suggestion.namespace));
      setCurrentMapCenter([suggestion.centroid[1], suggestion.centroid[0]]);
      setCurrentMapZoom(getZoomForNamespace(suggestion.namespace));
      const overview: GeospaceOverview = await getOverview(suggestion.id, '');
      const allData: GeospaceInfo = {
        ...overview,
        ...suggestion,
      };
      setSelectedGeospace(allData);
      openRightPanel();
      setLoading(false);
    } catch (e: any) {
      handleError(e);
    }
  }

  const selectGeospace = (geospace: GeospaceInfo, center?: L.LatLng) => {
    setLoading(true);
    setSelectedGeospace(geospace);
    if(center) {
      setCurrentMapCenter([center.lat, center.lng]);
      setCurrentMapZoom(getZoomForNamespace((geospace as GeospaceOverview).geospace.namespace));
    } else if((geospace as GeospaceOverview).geospace.centroid) {
      const centroid: Array<number> = (geospace as GeospaceOverview).geospace.centroid;
      setCurrentMapCenter([centroid[1], centroid[0]]);
      setCurrentMapZoom(getZoomForNamespace((geospace as GeospaceOverview).geospace.namespace));
    }
    openRightPanel();
    setLoading(false);
  }

  const recenterMap = () => {
    setCurrentMapCenter([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
    setCurrentMapZoom(3);
  }

  return (
    <div style={styles.ExplorePageContainer}>
      { loading && <MyOverlayingLoader/> }
      <MyMap namespace={geospaceNamespace}
             selectedGeospace={selectedGeospace}
             selectGeospace={selectGeospace}
             speedType={speedType}
             calendarType={calendarType}
             provider={provider}
             selectedSpeedFilters={selectedSpeedFilters}
             initialZoom={currentMapZoom}
             setZoom={setCurrentMapZoom}
             initialCenter={currentMapCenter}
             setCenter={setCurrentMapCenter}
             setLoading={setLoading}
             isRightPanelHidden={isRightPanelHidden}
      />
      <DatePicker />
      <TopSearchbar selectSuggestion={selectSuggestion}/>
      <TopFilters isRightPanelOpen={isRightPanelOpen && !isRightPanelHidden}
                  setGeospaceNamespace={setGeospaceNamespace}
                  setSpeedType={setSpeedType}
                  setCalendarType={setCalendarType}
                  setProvider={setProvider}
                  geospaceNamespace={geospaceNamespace}
                  speedType={speedType}
                  calendarType={calendarType}
                  provider={provider}
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
                    setCalendarType={setCalendarType}
                    provider={provider}
                    setProvider={setProvider}
                    toggleHidden={togglePanel}
                    isHidden={isRightPanelHidden}
        />
      }
    </div>
  )
}

export default ExplorePage;