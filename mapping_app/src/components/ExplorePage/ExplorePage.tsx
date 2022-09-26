import {ReactElement, useState} from "react";
import {styles} from "./styles/ExplorePage.style";
import MyMap from "./MyMap";
import ExplorationPopover from "./ExplorationPopover/ExplorationPopover";
import ExplorationPopoverIcon from "./ExplorationPopover/ExplorationPopoverIcon";
import TopSearchbar from "./TopSearchbar/TopSearchbar";
import TopFilters from "./TopFilters/TopFilters";
import SpeedFilters from "./SpeedFilters/SpeedFilters";
import RightPanel from "./RightPanel/RightPanel";
import {SelectedStateInfo, SignalStates} from "../../utils/types";
import GeographicalTooltip from "./GeographicalTooltip/GeographicalTooltip";

const mockStateInfo: SelectedStateInfo = {
  name: 'Colorado',
  country: 'U.S.A.',
  signalState: SignalStates.UNSERVED,
  medianDownload: 20.30,
  medianUpload: 18.20,
  medianLatency: 0.3,
  unservedPeopleCount: 10,
  underservedPeopleCount: 25,
  servedPeopleCount: 34,
}

const ExplorePage = (): ReactElement => {

  const [isExplorationPopoverOpen, setIsExplorationPopoverOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Just for testing actual popover appearing/disappearing
  const [isTooltipOpen, setIsTooltipOpen] = useState(true);
  const openTooltip = () => setIsTooltipOpen(true);

  const closePopover = () => setIsExplorationPopoverOpen(false);

  const openPopover = () => setIsExplorationPopoverOpen(true);

  const openRightPanel = () => setIsRightPanelOpen(true);

  const closeRightPanel = () => setIsRightPanelOpen(false);

  return (
    <div style={styles.ExplorePageContainer()}>
      <MyMap />
      <TopSearchbar />
      <TopFilters isRightPanelOpen={isRightPanelOpen}/>
      <SpeedFilters isRightPanelOpen={isRightPanelOpen}/>
      { isExplorationPopoverOpen && <ExplorationPopover closePopover={closePopover}/> }
      { !isExplorationPopoverOpen && <ExplorationPopoverIcon openPopover={openPopover}/> }
      { !isRightPanelOpen && <button style={{position: 'absolute', zIndex: 1000, right: '25px', top: '50%'}} onClick={openRightPanel}>Open panel</button> }
      {  isRightPanelOpen && <RightPanel closePanel={closeRightPanel} selectedStateInfo={mockStateInfo}/> }
      { !isTooltipOpen &&  <button style={{position: 'absolute', zIndex: 1000, left: '50%', top: '50%'}} onClick={openTooltip}>Open tooltip</button> }
      { isTooltipOpen && <GeographicalTooltip areaInfo={mockStateInfo}/>}
    </div>
  )
}

export default ExplorePage;