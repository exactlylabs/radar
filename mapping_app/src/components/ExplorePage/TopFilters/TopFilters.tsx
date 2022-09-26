import {ReactElement, useState} from "react";
import {styles} from "./styles/TopFilters.style";
import OpenFiltersButton from "./OpenFiltersButton";
import Filters from "./Filters";

interface TopFiltersProps {
  isRightPanelOpen: boolean;
}

const TopFilters = ({
  isRightPanelOpen
}: TopFiltersProps): ReactElement => {

  const [filtersOpen, setFiltersOpen] = useState(true);

  const openFilters = () => setFiltersOpen(true);

  const closeFilters = () => setFiltersOpen(false);

  return (
    <div style={styles.TopFiltersContainer(isRightPanelOpen)}>
      {!filtersOpen && <OpenFiltersButton openFilters={openFilters}/>}
      { filtersOpen && <Filters closeFilters={closeFilters} extendedView={!isRightPanelOpen}/>}
    </div>
  )
}

export default TopFilters;