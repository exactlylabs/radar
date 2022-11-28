import {ReactElement, useState} from "react";
import {styles} from "./styles/MenuContentFullGeospace.style";
import DropdownFilters from "../../../ExplorePage/TopFilters/DropdownFilters";
import RightPanelSpeedData from "../../../ExplorePage/RightPanel/RightPanelSpeedData";
import RightPanelHorizontalDivider from "../../../ExplorePage/RightPanel/RightPanelHorizontalDivider";
import SpeedDistribution from "../../../ExplorePage/RightPanel/SpeedDistribution";
import {getServedPeopleCount, getUnderservedPeopleCount, getUnservedPeopleCount} from "../../../../utils/percentages";
import CustomGenericMenu from "../CustomGenericMenu";
import MenuContentCalendar from "../MenuContentCalendar/MenuContentCalendar";
import {FilterTypes, getFilterMenuContentFromFilter} from "../../../../utils/filters";
import './styles/MenuContentFullGeospace.css';
import {MenuContent} from "../menu";
import {DateFilter, getInitialStateFromCalendarType} from "../../../../utils/dates";
import MenuContentProviders from "../MenuContentProviders/MenuContentProviders";
import {Asn} from "../../../../api/asns/types";
import MenuContentSpeedType from "../MenuContentSpeedType/MenuContentSpeedType";
import MenuContentCustomDateRange from "../MenuContentCustomRange/MenuContentCustomDateRange";
import {Optional} from "../../../../utils/types";
import {GeoJSONFilters} from "../../../../api/geojson/types";
import {getOverview} from "../../../../api/geospaces/requests";
import {handleError} from "../../../../api";
import {getSignalState} from "../../../../utils/speeds";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../../api/geospaces/types";
import RightPanelHeader from "../../../ExplorePage/RightPanel/RightPanelHeader";

interface MenuContentFullGeospaceLoadedProps {
  geospace: GeospaceOverview;
  setSelectedGeoSpaceInfo: (value: GeospaceInfo) => void;
  setLoading: (loading: boolean) => void;
  speedType: string;
  setSpeedType: (value: string) => void;
  calendarType: string;
  setCalendarType: (value: string) => void;
  provider: Asn;
  setProvider: (value: Asn) => void;
  applyRanges: (dateObject: DateFilter) => void;
  geospaceName: string;
}

const MenuContentFullGeospaceLoaded = ({
  geospace,
  setSelectedGeoSpaceInfo,
  setLoading,
  speedType,
  setSpeedType,
  calendarType,
  setCalendarType,
  provider,
  setProvider,
  applyRanges,
  geospaceName
}: MenuContentFullGeospaceLoadedProps): ReactElement => {

  const [isMenuContentOpen, setIsMenuContentOpen] = useState(false);
  const [menuContent, setMenuContent] = useState<Optional<MenuContent>>(null);

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
                               setSelectedOption={(option: string) => handleFilterChange({speedType, calendar: option, provider})}
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
                                setSelectedOption={(option: Asn) => handleFilterChange({speedType, calendar: calendarType, provider: option})}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.SPEED_TYPE:
        return (
          <MenuContentSpeedType selectedOption={speedType as string}
                                setSelectedOption={(option: string) => handleFilterChange({speedType: option, calendar: calendarType, provider})}
                                closeMenu={closeMenu}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <MenuContentCustomDateRange goBack={() => openFilterMenu(FilterTypes.CALENDAR)}
                                      applyRanges={applyRanges}
                                      initialState={getInitialStateFromCalendarType(calendarType as string)}
          />
        )
      default:
        return null;
    }
  }

  const handleFilterChange = async (filters: GeoJSONFilters) => {
    setSpeedType(filters.speedType);
    setCalendarType(filters.calendar);
    setProvider(filters.provider);
    setLoading(true);
    closeMenu();
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
      const overview: GeospaceOverview = await getOverview(geospaceId, filters);
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

  return (
    <div style={styles.MenuContentWrapper}>
      <div style={styles.GradientUnderlay}></div>
      <div>
        <RightPanelHeader geospaceName={geospaceName}
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
      {isMenuContentOpen && <CustomGenericMenu closeMenu={closeMenu} isDarker>{getContent()}</CustomGenericMenu>}
    </div>
  )
}

export default  MenuContentFullGeospaceLoaded;