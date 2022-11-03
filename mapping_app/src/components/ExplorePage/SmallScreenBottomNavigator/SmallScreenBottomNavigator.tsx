import {ReactElement} from "react";
import SmallGeographicalCategoryTabs from "./SmallGeographicalCategoryTabs/SmallGeographicalCategoryTabs";
import {styles} from "./styles/SmallScreenBottomNavigator.style";
import SmallSpeedFilters from "./SmallSpeedFilters/SmallSpeedFilters";
import {Filter} from "../../../utils/types";
import {GeospaceOverview} from "../../../api/geospaces/types";
import SmallExplorationPopover from "./SmallExplorationPopover/SmallExplorationPopover";

interface SmallScreenBottomNavigatorProps {
  geospaceNamespace: string;
  setGeospaceNamespace: (namespace: string) => void;
  areSpeedFiltersOpen: boolean;
  setAreSpeedFiltersOpen: (value: boolean) => void;
  speedType: string;
  selectedSpeedFilters: Array<Filter>;
  setSelectedSpeedFilters: (filters: Array<Filter>) => void;
}

const SmallScreenBottomNavigator = ({
  geospaceNamespace,
  setGeospaceNamespace,
  areSpeedFiltersOpen,
  setAreSpeedFiltersOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters,
}: SmallScreenBottomNavigatorProps): ReactElement => {
  return (
    <div style={styles.SmallScreenBottomNavigatorContainer}>
      <SmallGeographicalCategoryTabs namespace={geospaceNamespace}
                                     selectNamespace={setGeospaceNamespace}
      />
      <SmallSpeedFilters isOpen={areSpeedFiltersOpen}
                         setIsOpen={setAreSpeedFiltersOpen}
                         speedType={speedType}
                         selectedSpeedFilters={selectedSpeedFilters}
                         setSelectedSpeedFilters={setSelectedSpeedFilters}
      />
    </div>
  )
}

export default SmallScreenBottomNavigator;