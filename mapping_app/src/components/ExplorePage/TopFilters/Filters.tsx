import {ReactElement} from "react";
import {styles} from "./styles/Filters.style";
import GeographicalCategoryTabs from "./GeographicalCategoryTabs";
import DropdownFilters from "./DropdownFilters";
import HideFiltersButton from "./HideFiltersButton";

interface FiltersProps {
  closeFilters: () => void;
  extendedView: boolean;
}

const Filters = ({
  closeFilters,
  extendedView,
}: FiltersProps): ReactElement => {

  return (
    <div style={styles.FiltersContainer()}>
      <GeographicalCategoryTabs/>
      {
        extendedView &&
        <div style={styles.ConditionalFiltersContainer()}>
          <DropdownFilters />
          <HideFiltersButton closeFilters={closeFilters}/>
        </div>
      }
    </div>
  )
}

export default Filters;