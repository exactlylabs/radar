import {ReactElement} from "react";
import {styles} from "./styles/RightPanel.style";
import HidePanelButton from "./HidePanelButton";
import DropdownFilters from "../TopFilters/DropdownFilters";
import RightPanelHeader from "./RightPanelHeader";
import RightPanelSpeedData from "./RightPanelSpeedData";
import RightPanelHorizontalDivider from "./RightPanelHorizontalDivider";
import SpeedDistribution from "./SpeedDistribution";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../api/geospaces/types";
import {
  getServedPeopleCount,
  getUnderservedPeopleCount,
  getUnservedPeopleCount
} from "../../../utils/percentages";
import {getOverview} from "../../../api/geospaces/requests";
import {handleError} from "../../../api";
import {Asn} from "../../../api/asns/types";
import {GeoJSONFilters} from "../../../api/geojson/types";
import RightPanelLoader from "./RightPanelLoader";
import {getSignalState} from "../../../utils/speeds";


interface RightPanelProps {
  closePanel: () => void;
  selectedGeospaceInfo: GeospaceInfo;
  setSelectedGeoSpaceInfo: (data: GeospaceInfo) => void;
  speedType: string;
  calendarType: string;
  provider: Asn;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: Asn) => void;
  toggleHidden: () => void;
  isHidden: boolean;
  openDatePicker: () => void;
  loading: boolean;
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
  setProvider,
  toggleHidden,
  isHidden,
  openDatePicker,
  loading,
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

  const handleFilterChange = async (filters: GeoJSONFilters) => {
    setSpeedType(filters.speedType);
    setCalendarType(filters.calendar);
    setProvider(filters.provider);
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
      const overview: GeospaceOverview = await getOverview(geospaceId, filters);
      const allData: GeospaceInfo = {
        ...selectedGeospaceInfo,
        ...overview,
        download_scores: overview.download_scores,
        upload_scores: overview.upload_scores,
      };
      setSelectedGeoSpaceInfo(allData);
    } catch (e: any) {
      handleError(e);
    }
  }

  return (
    <div style={styles.RightPanelContainer(isHidden)} id={'right-panel'}>
      <HidePanelButton onClick={toggleHidden} isHidden={isHidden}/>
      {
        !isHidden && !loading &&
        <div style={styles.RightPanelContentContainer}>
          <div style={styles.GradientUnderlay}></div>
          <div style={styles.RightPanelContentWrapper}>
            <RightPanelHeader geospaceName={getName()}
                              parentName={(selectedGeospaceInfo as GeospaceOverview).geospace.parent?.name}
                              country={'U.S.A'}
                              stateSignalState={getSignalState(speedType as string, selectedGeospaceInfo)}
                              closePanel={closePanel}
            />
            <div style={styles.DropdownFiltersContainer}>
              <DropdownFilters changeFilters={handleFilterChange}
                               speedType={speedType}
                               calendarType={calendarType}
                               provider={provider}
                               openDatePicker={openDatePicker}
                               selectedGeospaceId={(selectedGeospaceInfo as GeospaceOverview).geospace.id}
              />
            </div>
            <RightPanelSpeedData medianDownload={selectedGeospaceInfo.download_median}
                                 medianUpload={selectedGeospaceInfo.upload_median}
                                 medianLatency={selectedGeospaceInfo.latency_median}
                                 speedState={getSignalState(speedType as string, selectedGeospaceInfo)}
                                 speedType={speedType as string}
            />
            <RightPanelHorizontalDivider/>
            <SpeedDistribution unservedPeopleCount={getUnservedPeopleCount(speedType as string, selectedGeospaceInfo)}
                               underservedPeopleCount={getUnderservedPeopleCount(speedType as string, selectedGeospaceInfo)}
                               servedPeopleCount={getServedPeopleCount(speedType as string, selectedGeospaceInfo)}
                               speedType={speedType}
            />
          </div>
        </div>
      }
      {
        !isHidden && loading &&
        <RightPanelLoader geospaceName={getName()}
                          parentName={(selectedGeospaceInfo as GeospaceOverview).geospace.parent?.name}
                          country={'U.S.A'}
                          stateSignalState={getSignalState(speedType as string, selectedGeospaceInfo)}
                          closePanel={closePanel}/>
      }
    </div>
  )
}

export default RightPanel;