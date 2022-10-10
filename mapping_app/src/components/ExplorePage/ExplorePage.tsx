import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorePage.style";
import MyMap from "./MyMap";
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
import {calendarFilters, speedFilters} from "../../utils/filters";
import {allProvidersElement} from "./TopFilters/utils/providers";
import {getValueFromUrl, updateUrl} from "../../utils/base64";
import {Asn} from "../../api/asns/types";
import {tabs} from "./TopFilters/GeographicalCategoryTabs";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "../../utils/map";
import MyOverlayingLoader from "../common/MyOverlayingLoader";
import {emptyGeoJSONFilters} from "../../api/geojson/types";
import L from "leaflet";
import ExplorationPopoverIcon from "./ExplorationPopover/ExplorationPopoverIcon";

const ExplorePage = (): ReactElement => {

  const [loading, setLoading] = useState(false);
  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!!getValueFromUrl('selectedGeospace'));
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(getValueFromUrl('selectedGeospace') ?? null);
  const [geospaceNamespace, setGeospaceNamespace] = useState(getValueFromUrl('geospaceNamespace') ?? tabs.STATES);
  const [speedType, setSpeedType] = useState<string>(getValueFromUrl('speedType') ?? speedFilters[0]);
  const [calendarType, setCalendarType] = useState<string>(getValueFromUrl('calendarType') ?? calendarFilters[3]);
  const [provider, setProvider] = useState<Asn>(getValueFromUrl('provider') ?? allProvidersElement);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<string>>(getValueFromUrl('selectedSpeedFilters') ?? [speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);
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

  const closePopover = () => setIsExplorationPopoverOpen(false);

  const openPopover = () => setIsExplorationPopoverOpen(true);

  const togglePopover = () => {
    if(isExplorationPopoverOpen) closePopover();
    else openPopover();
  }

  const openRightPanel = () => setIsRightPanelOpen(true);

  const closeRightPanel = () => {
    setSelectedGeospace(null);
    setIsRightPanelOpen(false);
  }

  const selectSuggestion = async (suggestion: DetailedGeospace) => {
    try {
      setLoading(true);
      const overview: GeospaceOverview = await getOverview(suggestion.id, emptyGeoJSONFilters);
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
      setCurrentMapZoom(5);
    }
    openRightPanel();
    setLoading(false);
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
      />
      <TopSearchbar selectSuggestion={selectSuggestion}

      />
      <TopFilters isRightPanelOpen={isRightPanelOpen}
                  setGeospaceNamespace={setGeospaceNamespace}
                  setSpeedType={setSpeedType}
                  setCalendarType={setCalendarType}
                  setProvider={setProvider}
                  geospaceNamespace={geospaceNamespace}
                  speedType={speedType}
                  calendarType={calendarType}
                  provider={provider}
      />
      <SpeedFilters isRightPanelOpen={isRightPanelOpen}
                    speedType={speedType}
                    selectedSpeedFilters={selectedSpeedFilters}
                    setSelectedSpeedFilters={setSelectedSpeedFilters}
      />
      { isExplorationPopoverOpen ?
        <ExplorationPopover closePopover={closePopover} selectGeospace={selectGeospace}/> :
        <ExplorationPopoverIcon openPopover={openPopover}/>
      }
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
        />
      }
    </div>
  )
}

export default ExplorePage;