import {ReactElement, useState} from "react";
import {styles} from "./styles/ModalContentFullGeospace.style";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../../api/geospaces/types";
import {Filter, Optional} from "../../../../utils/types";
import {MenuContent} from "../../MyGenericMenu/menu";
import {getFiltersString} from "../../../../api/utils/filters";
import {getOverview} from "../../../../api/geospaces/requests";
import {handleError} from "../../../../api";
import {filterTypes, getFilterMenuContentFromFilter, getSignalState} from "../../../../utils/filters";
import MenuFullGeospaceLoader from "../../MyGenericMenu/MenuContentFullGeospace/MenuFullGeospaceLoader";
import {getGeospaceName} from "../../../../utils/geospaces";
import RightPanelHeader from "../../../ExplorePage/RightPanel/RightPanelHeader";
import DropdownFilters from "../../../ExplorePage/TopFilters/DropdownFilters";
import RightPanelSpeedData from "../../../ExplorePage/RightPanel/RightPanelSpeedData";
import RightPanelHorizontalDivider from "../../../ExplorePage/RightPanel/RightPanelHorizontalDivider";
import SpeedDistribution from "../../../ExplorePage/RightPanel/SpeedDistribution";
import {getServedPeopleCount, getUnderservedPeopleCount, getUnservedPeopleCount} from "../../../../utils/percentages";
import MyGenericMenu from "../../MyGenericMenu/MyGenericMenu";
import MyGenericModal from "../MyGenericModal";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import ModalContentSpeedType from "../ModalContentSpeedType/ModalContentSpeedType";
import ModalContentProviders from "../ModalContentProviders/ModalContentProviders";
import {Asn} from "../../../../api/asns/types";
import ModalContentCalendar from "../ModalContentCalendar/ModalContentCalendar";
import {getInitialStateFromCalendarType} from "../../../../utils/dates";
import ModalContentCustomDateRange from "../ModalContentCustomDateRange/ModalContentCustomDateRange";

interface ModalContentFullGeospaceProps {
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

const ModalContentFullGeospace = ({
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
}: ModalContentFullGeospaceProps): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Optional<MenuContent>>(null);

  const closeModal = () => setIsModalOpen(false);

  const openFilterModal = (filter: string) => {
    setModalContent(getFilterMenuContentFromFilter(filter));
    setIsModalOpen(true);
  }

  const handleFilterChange = async (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
    setLoading(true);
    closeModal();
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

  const getModalContent = (): Optional<ReactElement> => {
    switch (modalContent) {
      case MenuContent.SPEED_TYPE:
        return (
          <ModalContentSpeedType selectedOption={speedType as string}
                                 setSelectedOption={(option: string) => handleFilterChange([option, calendarType, provider])}
                                 closeModal={closeModal}
          />
        );
      case MenuContent.PROVIDERS:
        return (
          <ModalContentProviders geospaceId={geospace.geospace.id}
                                 selectedOption={provider as Asn}
                                 setSelectedOption={(option: Asn) => handleFilterChange([speedType, calendarType, option])}
                                 closeModal={closeModal}
          />
        );
      case MenuContent.CALENDAR:
        return (
          <ModalContentCalendar selectedOption={calendarType as string}
                                setSelectedOption={(option: string) => handleFilterChange([speedType, option, provider])}
                                closeModal={closeModal}
                                applyRanges={applyRanges}
                                initialState={getInitialStateFromCalendarType(calendarType as string)}
                                setModalContent={setModalContent}
          />
        );
      case MenuContent.CUSTOM_DATE_RANGE:
        return (
          <ModalContentCustomDateRange goBack={() => openFilterModal(filterTypes.CALENDAR)}
                                       applyRanges={applyRanges}
                                       initialState={getInitialStateFromCalendarType(calendarType as string)}
                                       closeModal={closeModal}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div style={styles.ModalContentFullGeospace}>
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
                                 openFloatingFilter={openFilterModal}
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
            {isModalOpen && <MyGenericModal closeModal={closeModal}>{getModalContent()}</MyGenericModal>}
          </div>
      }
    </div>
  )
}

export default ModalContentFullGeospace;