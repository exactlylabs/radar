import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ExplorePage.style";
import MyMap from "./MyMap";
import ExplorationPopover from "./ExplorationPopover/ExplorationPopover";
import ExplorationPopoverIcon from "./ExplorationPopover/ExplorationPopoverIcon";
import TopSearchbar from "./TopSearchbar/TopSearchbar";
import TopFilters from "./TopFilters/TopFilters";
import SpeedFilters from "./SpeedFilters/SpeedFilters";
import RightPanel from "./RightPanel/RightPanel";
import {Optional} from "../../utils/types";
import {Geospace, GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {getOverview} from "../../api/geospaces/requests";
import {handleError} from "../../api";
import {speedTypes} from "../../utils/speeds";
import {calendarFilters, providerFilters, speedFilters} from "../../utils/filters";

const ExplorePage = (): ReactElement => {

  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedGeospace, setSelectedGeospace] = useState<Optional<GeospaceInfo>>(null);
  const [geospaceNamespace, setGeospaceNamespace] = useState('states');
  const [speedType, setSpeedType] = useState(speedFilters[0]);
  const [calendarType, setCalendarType] = useState(calendarFilters[0]);
  const [provider, setProvider] = useState(providerFilters[0]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState<Array<string>>([speedTypes.UNSERVED, speedTypes.UNDERSERVED, speedTypes.SERVED]);

  const closePopover = () => setIsExplorationPopoverOpen(false);

  const openPopover = () => setIsExplorationPopoverOpen(true);

  const openRightPanel = () => setIsRightPanelOpen(true);

  const closeRightPanel = () => {
    setSelectedGeospace(null);
    setIsRightPanelOpen(false);
  }

  const selectSuggestion = async (suggestion: Geospace) => {
    try {
      const overview: GeospaceOverview = await getOverview(suggestion.id, '');
      const allData: GeospaceInfo = {
        ...overview,
        ...suggestion,
      };
      setSelectedGeospace(allData);
      openRightPanel();
    } catch (e: any) {
      handleError(e);
    }
  }

  const selectGeospace = (geospace: GeospaceInfo) => {
    setSelectedGeospace(geospace);
    openRightPanel();
  }

  return (
    <div style={styles.ExplorePageContainer}>
      <MyMap namespace={geospaceNamespace}
             selectedGeospace={selectedGeospace}
             selectGeospace={selectGeospace}
             speedType={speedType}
             calendarType={calendarType}
             provider={provider}
             selectedSpeedFilters={selectedSpeedFilters}
      />
      <TopSearchbar selectSuggestion={selectSuggestion}

      />
      <TopFilters isRightPanelOpen={isRightPanelOpen}
                  setGeospaceNamespace={setGeospaceNamespace}
                  setSpeedType={setSpeedType}
                  setCalendarType={setCalendarType}
                  setProvider={setProvider}
                  speedType={speedType}
                  calendarType={calendarType}
                  provider={provider}
      />
      <SpeedFilters isRightPanelOpen={isRightPanelOpen}
                    speedType={speedType}
                    selectedSpeedFilters={selectedSpeedFilters}
                    setSelectedSpeedFilters={setSelectedSpeedFilters}
      />
      { isExplorationPopoverOpen &&
        <ExplorationPopover closePopover={closePopover}
                            selectGeospace={selectGeospace}
        />
      }
      { !isExplorationPopoverOpen &&
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