import {ReactElement} from "react";
import SmallGeographicalCategoryTabs from "./SmallGeographicalCategoryTabs/SmallGeographicalCategoryTabs";
import {styles} from "./styles/SmallScreenBottomNavigator.style";
import SmallSpeedFilters from "./SmallSpeedFilters/SmallSpeedFilters";
import {Filter} from "../../../utils/types";

interface SmallScreenBottomNavigatorProps {
  geospaceNamespace: string;
  setGeospaceNamespace: (namespace: string) => void;
  areSpeedFiltersOpen: boolean;
  setAreSpeedFiltersOpen: (value: boolean) => void;
  speedType: string;
  selectedSpeedFilters: Array<Filter>;
  setSelectedSpeedFilters: (filters: Array<Filter>) => void;
  isRightPanelOpen: boolean;
}

const SmallScreenBottomNavigator = ({
  geospaceNamespace,
  setGeospaceNamespace,
  areSpeedFiltersOpen,
  setAreSpeedFiltersOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters,
  isRightPanelOpen
}: SmallScreenBottomNavigatorProps): ReactElement => {
  return (
    <div style={styles.SmallScreenBottomNavigatorContainer}>
      <SmallGeographicalCategoryTabs namespace={geospaceNamespace}
                                     selectNamespace={setGeospaceNamespace}
                                     isRightPanelOpen={isRightPanelOpen}
      />
      <SmallSpeedFilters isOpen={areSpeedFiltersOpen}
                         setIsOpen={setAreSpeedFiltersOpen}
                         speedType={speedType}
                         selectedSpeedFilters={selectedSpeedFilters}
                         setSelectedSpeedFilters={setSelectedSpeedFilters}
                         isRightPanelOpen={isRightPanelOpen}
      />
    </div>
  )
}

export default SmallScreenBottomNavigator;