import {ReactElement} from "react";
import {styles} from "./styles/Filters.style";
import GeographicalCategoryTabs from "./GeographicalCategoryTabs";
import DropdownFilters from "./DropdownFilters";
import HideFiltersButton from "./HideFiltersButton";

interface FiltersProps {
  closeFilters: () => void;
  extendedView: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: string) => void;
  speedType: string;
  calendarType: string;
  provider: string;
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

  const handleChangeFilters = (filters: Array<string>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
  }

  return (
    <div style={styles.FiltersContainer()}>
      <GeographicalCategoryTabs setGeospaceNamespace={setGeospaceNamespace}/>
      {
        extendedView &&
        <div style={styles.ConditionalFiltersContainer()}>
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