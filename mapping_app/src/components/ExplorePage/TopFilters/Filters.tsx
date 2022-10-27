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
  setSpeedType: (type: Filter) => void;
  setCalendarType: (type: Filter) => void;
  setProvider: (type: Filter) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
}

const Filters = ({
  closeFilters,
  extendedView,
  setGeospaceNamespace,
  setSpeedType,
  setCalendarType,
  setProvider,
  speedType,
  calendarType,
  provider
}: FiltersProps): ReactElement => {

  const handleChangeFilters = (filters: GeoJSONFilters) => {
    setSpeedType(filters.speedType);
    setCalendarType(filters.calendar);
    setProvider(filters.provider);
  }

  return (
    <div style={styles.FiltersContainer}>
      <GeographicalCategoryTabs setGeospaceNamespace={setGeospaceNamespace}/>
      {
        extendedView &&
        <div style={styles.ConditionalFiltersContainer}>
          <DropdownFilters changeFilters={handleChangeFilters}
                           speedType={speedType as string}
                           calendarType={calendarType as string}
                           provider={provider as Asn}
          />
          <HideFiltersButton closeFilters={closeFilters}/>
        </div>
      }
    </div>
  )
}

export default Filters;