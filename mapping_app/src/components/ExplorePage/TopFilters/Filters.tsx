import {ReactElement} from "react";
import {styles} from "./styles/Filters.style";
import GeographicalCategoryTabs from "./GeographicalCategoryTabs";
import DropdownFilters from "./DropdownFilters";
import HideFiltersButton from "./HideFiltersButton";
import {Filter} from "../../../utils/types";

interface FiltersProps {
  closeFilters: () => void;
  extendedView: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: Filter) => void;
  setCalendarType: (type: Filter) => void;
  setProvider: (type: Filter) => void;
  geospaceNamespace: string;
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
  geospaceNamespace,
  speedType,
  calendarType,
  provider
}: FiltersProps): ReactElement => {

  const handleChangeFilters = (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
  }

  return (
    <div style={styles.FiltersContainer}>
      <GeographicalCategoryTabs geospaceNamespace={geospaceNamespace}
                                setGeospaceNamespace={setGeospaceNamespace}
      />
      {
        extendedView &&
        <div style={styles.ConditionalFiltersContainer}>
          <DropdownFilters changeFilters={handleChangeFilters}
                           speedType={speedType}
                           calendarType={calendarType}
                           provider={provider}
          />
          <HideFiltersButton closeFilters={closeFilters}/>
        </div>
      }
    </div>
  )
}

export default Filters;