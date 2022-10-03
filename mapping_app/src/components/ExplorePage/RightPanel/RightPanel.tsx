import {ReactElement} from "react";
import {styles} from "./styles/RightPanel.style";
import ClosePanelButton from "./ClosePanelButton";
import DropdownFilters from "../TopFilters/DropdownFilters";
import RightPanelHeader from "./RightPanelHeader";
import RightPanelSpeedData from "./RightPanelSpeedData";
import RightPanelHorizontalDivider from "./RightPanelHorizontalDivider";
import SpeedDistribution from "./SpeedDistribution";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload} from "../../../utils/speeds";
import {getPeopleCount} from "../../../utils/percentages";
import {getFiltersString} from "../../../api/utils/filters";
import {getOverview} from "../../../api/geospaces/requests";
import {handleError} from "../../../api";

interface RightPanelProps {
  closePanel: () => void;
  selectedGeospaceInfo: GeospaceInfo;
  setSelectedGeoSpaceInfo: (data: GeospaceInfo) => void;
  speedType: string;
  calendarType: string;
  provider: string;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: string) => void;
}

const RightPanel = ({
  closePanel,
  selectedGeospaceInfo,
  setSelectedGeoSpaceInfo,
  speedType,
  calendarType,
  provider,
  setSpeedType,
  setCalendarType,
  setProvider
}: RightPanelProps): ReactElement => {

  const getName = (): string => {
    if(isGeospaceData(selectedGeospaceInfo)) {
      if(selectedGeospaceInfo.state) return selectedGeospaceInfo.state as string;
      else return selectedGeospaceInfo.county as string;
    } else {
      const info: GeospaceOverview = selectedGeospaceInfo as GeospaceOverview;
      return info.geospace.name;
    }
  }

  const handleFilterChange = async (filters: Array<string>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
    const filtersString: string = getFiltersString(filters);
    try {
      let geospaceId: string;
      if(isGeospaceData(selectedGeospaceInfo)) {
        const {county_geospace_id, state_geospace_id} = selectedGeospaceInfo;
        if (county_geospace_id) geospaceId = county_geospace_id as string;
        else geospaceId = state_geospace_id as string;
      } else {
        const info: GeospaceOverview = selectedGeospaceInfo as GeospaceOverview;
        geospaceId = info.geospace.id;
      }
      const overview: GeospaceOverview = await getOverview(geospaceId, filtersString);
      const allData: GeospaceInfo = {
        ...overview,
        ...selectedGeospaceInfo,
        download_scores: { ...overview.download_scores },
        upload_scores: { ...overview.upload_scores },
      };
      setSelectedGeoSpaceInfo(allData);
    } catch (e: any) {
      handleError(e);
    }
  }

  const getSignalState = (): string => {
    return speedType === 'Download' ?
      getSignalStateDownload(selectedGeospaceInfo.download_median) : getSignalStateUpload(selectedGeospaceInfo.upload_median);
  }

  const getUnservedPeopleCount = () => {
    const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.bad : selectedGeospaceInfo.upload_scores.bad;
    const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
    return getPeopleCount(percentage, totalSamples)
  }

  const getUnderservedPeopleCount = () => {
    const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.medium : selectedGeospaceInfo.upload_scores.medium;
    const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
    return getPeopleCount(percentage, totalSamples)
  }

  const getServedPeopleCount = () => {
    const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.good : selectedGeospaceInfo.upload_scores.good;
    const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
    return getPeopleCount(percentage, totalSamples)
  }

  return (
    <div style={styles.RightPanelContainer()} id={'right-panel'}>
      <ClosePanelButton onClick={closePanel}/>
      <div style={styles.RightPanelContentContainer()}>
        <div style={styles.RightPanelContentWrapper()}>
          <RightPanelHeader stateName={getName()}
                            stateCountry={'U.S.A'}
                            stateSignalState={getSignalState()}
                            closePanel={closePanel}
          />
          <div style={styles.DropdownFiltersContainer()}>
            <DropdownFilters changeFilters={handleFilterChange}
                             speedType={speedType}
                             calendarType={calendarType}
                             provider={provider}
            />
          </div>
          <RightPanelSpeedData medianDownload={selectedGeospaceInfo.download_median}
                               medianUpload={selectedGeospaceInfo.upload_median}
                               medianLatency={selectedGeospaceInfo.latency_median}
                               speedState={getSignalState()}
          />
          <RightPanelHorizontalDivider />
          <SpeedDistribution unservedPeopleCount={getUnservedPeopleCount()}
                             underservedPeopleCount={getUnderservedPeopleCount()}
                             servedPeopleCount={getServedPeopleCount()}
                             speedType={speedType}
          />
        </div>
      </div>
    </div>
  )
}

export default RightPanel;