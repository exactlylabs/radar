import {ReactElement} from "react";
import {styles} from "./styles/Filters.style";
import GeographicalCategoryTabs from "./GeographicalCategoryTabs";
import DropdownFilters from "./DropdownFilters";
import HideFiltersButton from "./HideFiltersButton";
import {Filter} from "../../../utils/types";
import {Asn} from "../../../api/asns/types";
import {GeoJSONFilters} from "../../../api/geojson/types";

interface FiltersProps {
  closeFilters: () => void;
  extendedView: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: Asn) => void;
  geospaceNamespace: string;
  speedType: string;
  calendarType: string;
  provider: Asn;
  openDatePicker: () => void;
  isRightPanelHidden: boolean;
}

const Filters = ({
  closeFilters,
  extendedView,
  setGeospaceNamespace,
  setSpeedType,
  setCalendarType,
  setProvider,
  geospaceNamespace,
  speedType,
  calendarType,
  provider,
  openDatePicker,
  isRightPanelHidden
}: FiltersProps): ReactElement => {

  const handleChangeFilters = (filters: GeoJSONFilters) => {
    setSpeedType(filters.speedType);
    setCalendarType(filters.calendar);
    setProvider(filters.provider);
  }

  return (
    <div style={styles.FiltersContainer}>
      <GeographicalCategoryTabs geospaceNamespace={geospaceNamespace}
                                setGeospaceNamespace={setGeospaceNamespace}
                                isRightPanelHidden={isRightPanelHidden}
      />
      {
        extendedView && !isRightPanelHidden &&
        <div style={styles.ConditionalFiltersContainer}>
          <DropdownFilters changeFilters={handleChangeFilters}
                           speedType={speedType}
                           calendarType={calendarType}
                           provider={provider}
                           openDatePicker={openDatePicker}
          />
          <HideFiltersButton closeFilters={closeFilters}/>
        </div>
      }
    </div>
  )
}

export default Filters;