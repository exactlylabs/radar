import {ReactElement, useState} from "react";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../../api/geospaces/types";
import {Filter, Optional} from "../../../../utils/types";
import RightPanelHeader from "../../../ExplorePage/RightPanel/RightPanelHeader";
import DropdownFilters from "../../../ExplorePage/TopFilters/DropdownFilters";
import RightPanelSpeedData from "../../../ExplorePage/RightPanel/RightPanelSpeedData";
import RightPanelHorizontalDivider from "../../../ExplorePage/RightPanel/RightPanelHorizontalDivider";
import SpeedDistribution from "../../../ExplorePage/RightPanel/SpeedDistribution";
import {getServedPeopleCount, getUnderservedPeopleCount, getUnservedPeopleCount} from "../../../../utils/percentages";
import {filterTypes, getFilterMenuContentFromFilter, getSignalState} from "../../../../utils/filters";
import {getFiltersString} from "../../../../api/utils/filters";
import {getOverview} from "../../../../api/geospaces/requests";
import {handleError} from "../../../../api";
import {styles} from "./styles/MenuContentFullGeospace.style";
import './styles/MenuContentFullGeospace.css';
import MyGenericMenu from "../MyGenericMenu";
import {MenuContent} from "../menu";
import {Asn} from "../../../../api/asns/types";
import {getInitialStateFromCalendarType} from "../../../../utils/dates";
import MenuContentCalendar from "../MenuContentCalendar/MenuContentCalendar";
import MenuContentProviders from "../MenuContentProviders/MenuContentProviders";
import MenuContentSpeedType from "../MenuContentSpeedType/MenuContentSpeedType";
import MenuContentCustomDateRange from "../MenuContentCustomRange/MenuContentCustomDateRange";
import MenuFullGeospaceLoader from "./MenuFullGeospaceLoader";
import {getGeospaceName} from "../../../../utils/geospaces";

interface MenuContentFullGeospaceProps {
  geospace: GeospaceOverview;
  setSelectedGeoSpaceInfo: (value: GeospaceInfo) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  speedType: Filter;
  setSpeedType: (value: Filter) => void;
  calendarType: Filter;
  setCalendarType: (value: Filter) => void;
  provider: Filter;
  setProvider: (value: Filter) => void;
  applyRanges: (queryString: string) => void;
}

const MenuContentFullGeospace = ({
  geospace,
  setSelectedGeoSpaceInfo,
  loading,
  setLoading,
  speedType,
  setSpeedType,
  calendarType,
  setCalendarType,
  provider,
  setProvider,
  applyRanges,
}: MenuContentFullGeospaceProps): ReactElement => {

  const [isMenuContentOpen, setIsMenuContentOpen] = useState(false);
  const [menuContent, setMenuContent] = useState<Optional<MenuContent>>(null);

  const handleFilterChange = async (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
    setLoading(true);
    closeMenu();
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
        download_scores: overview.download_scores,
        upload_scores: overview.upload_scores,
      };
      setSelectedGeoSpaceInfo(allData);
    } catch (e: any) {
      handleError(e);
    }
    setLoading(false);
  }

  const closeMenu = () => setIsMenuContentOpen(false);

  const openFilterMenu = (filter: string) => {
    setMenuContent(getFilterMenuContentFromFilter(filter));
    setIsMenuContentOpen(true);
  }

  const getContent = () => {
    switch (menuContent) {
      case MenuContent.CALENDAR:
        return (
          <MenuContentCalendar selectedOption={calendarType as string}
                               setSelectedOption={(option: string) => handleFilterChange([speedType, option, provider])}
                               closeMenu={closeMenu}
                               applyRanges={applyRanges}
                               initialState={getInitialStateFromCalendarType(calendarType as string)}
                               setMenuContent={setMenuContent}
          />
        );
      case MenuContent.PROVIDERS:
        return (
          <MenuContentProviders geospaceId={geospace.geospace.id}
                                selectedOption={provider as Asn}
                                setSelectedOption={(option: Asn) => handleFilterChange([speedType, calendarType, option])}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.SPEED_TYPE:
        return (
          <MenuContentSpeedType selectedOption={speedType as string}
                                setSelectedOption={(option: string) => handleFilterChange([option, calendarType, provider])}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <MenuContentCustomDateRange goBack={() => openFilterMenu(filterTypes.CALENDAR)}
                                      applyRanges={applyRanges}
                                      initialState={getInitialStateFromCalendarType(calendarType as string)}
          />
        )
      default:
        return null;
    }
  }

  return (
    <div style={styles.MenuFullGeospaceContentContainer}>
      {
        loading ?
          <MenuFullGeospaceLoader geospaceName={getGeospaceName(geospace)}
                                  parentName={(geospace as GeospaceOverview).geospace.parent?.name}
                                  stateSignalState={getSignalState(speedType as string, geospace)}
                                  country={'U.S.A'}
          /> :
          <div style={styles.MenuContentWrapper}>
            <div style={styles.GradientUnderlay}></div>
            <div>
              <RightPanelHeader geospaceName={getGeospaceName(geospace)}
                                parentName={(geospace as GeospaceOverview).geospace.parent?.name}
                                country={'U.S.A'}
                                stateSignalState={getSignalState(speedType as string, geospace)}
              />
              <div style={styles.DropdownFiltersContainer}>
                <DropdownFilters changeFilters={handleFilterChange}
                                 speedType={speedType}
                                 calendarType={calendarType}
                                 provider={provider}
                                 openDatePicker={() => {
                                 }}
                                 selectedGeospaceId={(geospace as GeospaceOverview).geospace.id}
                                 isInsideContainer
                                 openFloatingFilter={openFilterMenu}
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
            {isMenuContentOpen && <MyGenericMenu closeMenu={closeMenu}>{getContent()}</MyGenericMenu>}
          </div>
      }
    </div>
  )
}

export default MenuContentFullGeospace;