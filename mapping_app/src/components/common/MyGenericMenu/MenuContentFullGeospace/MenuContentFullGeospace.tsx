import {ReactElement} from "react";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../../api/geospaces/types";
import { Filter } from "../../../../utils/types";
import RightPanelHeader from "../../../ExplorePage/RightPanel/RightPanelHeader";
import DropdownFilters from "../../../ExplorePage/TopFilters/DropdownFilters";
import RightPanelSpeedData from "../../../ExplorePage/RightPanel/RightPanelSpeedData";
import RightPanelHorizontalDivider from "../../../ExplorePage/RightPanel/RightPanelHorizontalDivider";
import SpeedDistribution from "../../../ExplorePage/RightPanel/SpeedDistribution";
import {getServedPeopleCount, getUnderservedPeopleCount, getUnservedPeopleCount} from "../../../../utils/percentages";
import {getSignalState} from "../../../../utils/filters";
import {getFiltersString} from "../../../../api/utils/filters";
import {getOverview} from "../../../../api/geospaces/requests";
import {handleError} from "../../../../api";
import {styles} from "./styles/MenuContentFullGeospace.style";
import './styles/MenuContentFullGeospace.css';

interface MenuContentFullGeospaceProps {
  geospace: GeospaceOverview;
  setSelectedGeoSpaceInfo: (value: GeospaceInfo) => void;
  loading: boolean;
  speedType: Filter;
  setSpeedType: (value: Filter) => void;
  calendarType: Filter;
  setCalendarType: (value: Filter) => void;
  provider: Filter;
  setProvider: (value: Filter) => void;
  openFilterMenu: (option: string) => void;
}

const MenuContentFullGeospace = ({
  geospace,
  setSelectedGeoSpaceInfo,
  loading,
  speedType,
  setSpeedType,
  calendarType,
  setCalendarType,
  provider,
  setProvider,
  openFilterMenu
}: MenuContentFullGeospaceProps): ReactElement => {

  const getName = (): string => {
    if(isGeospaceData(geospace)) {
      if(geospace.state) return geospace.state as string;
      else return geospace.county as string;
    } else {
      const info: GeospaceOverview = geospace as GeospaceOverview;
      return info.geospace.name;
    }
  }

  const handleFilterChange = async (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
    const filtersString: string = getFiltersString([filters[2], filters[1]]);
    try {
      let geospaceId: string;
      if(isGeospaceData(geospace)) {
        const {county_geospace_id, state_geospace_id} = geospace;
        if (county_geospace_id) geospaceId = county_geospace_id as string;
        else geospaceId = state_geospace_id as string;
      } else {
        const info: GeospaceOverview = geospace as GeospaceOverview;
        geospaceId = info.geospace.id;
      }
      const overview: GeospaceOverview = await getOverview(geospaceId, filtersString);
      const allData: GeospaceInfo = {
        ...geospace,
        ...overview,
        download_scores: { ...overview.download_scores },
        upload_scores: { ...overview.upload_scores },
      };
      setSelectedGeoSpaceInfo(allData);
    } catch (e: any) {
      handleError(e);
    }
  }

  return (
    <div style={styles.MenuFullGeospaceContentContainer}>
      <div style={styles.MenuContentWrapper}>
        <div style={styles.GradientUnderlay}></div>
        <div>
          <RightPanelHeader geospaceName={getName()}
                            parentName={(geospace as GeospaceOverview).geospace.parent?.name}
                            country={'U.S.A'}
                            stateSignalState={getSignalState(speedType as string, geospace)}
          />
          <div style={styles.DropdownFiltersContainer}>
            <DropdownFilters changeFilters={handleFilterChange}
                             speedType={speedType}
                             calendarType={calendarType}
                             provider={provider}
                             openDatePicker={() => {}}
                             selectedGeospaceId={(geospace as GeospaceOverview).geospace.id}
                             isInsideContainer
                             openFilterMenu={openFilterMenu}
            />
          </div>
        </div>
        <div style={styles.SpeedDataScrollableContainer} id={'menu-content-full-geospace--scrollable-container'}>
          <RightPanelSpeedData medianDownload={geospace.download_median}
                               medianUpload={geospace.upload_median}
                               medianLatency={geospace.latency_median}
                               speedState={getSignalState(speedType as string, geospace)}
                               speedType={speedType as string}
          />
          <RightPanelHorizontalDivider/>
          <SpeedDistribution unservedPeopleCount={getUnservedPeopleCount(speedType as string, geospace)}
                             underservedPeopleCount={getUnderservedPeopleCount(speedType as string, geospace)}
                             servedPeopleCount={getServedPeopleCount(speedType as string, geospace)}
                             speedType={speedType}
          />
        </div>
      </div>
    </div>
  )
}

export default MenuContentFullGeospace;