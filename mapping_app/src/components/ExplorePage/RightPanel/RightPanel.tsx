import {ReactElement} from "react";
import {styles} from "./styles/RightPanel.style";
import ClosePanelButton from "./ClosePanelButton";
import DropdownFilters from "../TopFilters/DropdownFilters";
import RightPanelHeader from "./RightPanelHeader";
import RightPanelSpeedData from "./RightPanelSpeedData";
import RightPanelHorizontalDivider from "./RightPanelHorizontalDivider";
import SpeedDistribution from "./SpeedDistribution";
import {SelectedStateInfo} from "../../../utils/types";

interface RightPanelProps {
  closePanel: () => void;
  selectedStateInfo: SelectedStateInfo;
}

const RightPanel = ({
  closePanel,
  selectedStateInfo,
}: RightPanelProps): ReactElement => {
  return (
    <div style={styles.RightPanelContainer()}>
      <ClosePanelButton onClick={closePanel}/>
      <div style={styles.RightPanelContentContainer()}>
        <div style={styles.RightPanelContentWrapper()}>
          <RightPanelHeader stateName={selectedStateInfo.name}
                            stateCountry={selectedStateInfo.country}
                            stateSignalState={selectedStateInfo.signalState}
                            closePanel={closePanel}
          />
          <div style={styles.DropdownFiltersContainer()}>
            <DropdownFilters />
          </div>
          <RightPanelSpeedData medianDownload={selectedStateInfo.medianDownload}
                               medianUpload={selectedStateInfo.medianUpload}
                               medianLatency={selectedStateInfo.medianLatency}
                               speedState={selectedStateInfo.signalState}
          />
          <RightPanelHorizontalDivider />
          <SpeedDistribution unservedPeopleCount={selectedStateInfo.unservedPeopleCount}
                             underservedPeopleCount={selectedStateInfo.underservedPeopleCount}
                             servedPeopleCount={selectedStateInfo.servedPeopleCount}
          />
        </div>
      </div>
    </div>
  )
}

export default RightPanel;