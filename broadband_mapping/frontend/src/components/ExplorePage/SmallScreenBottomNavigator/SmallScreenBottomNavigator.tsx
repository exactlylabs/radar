import {ReactElement} from "react";
import SmallGeographicalCategoryTabs from "./SmallGeographicalCategoryTabs/SmallGeographicalCategoryTabs";
import {styles} from "./styles/SmallScreenBottomNavigator.style";
import SmallSpeedFilters from "./SmallSpeedFilters/SmallSpeedFilters";

interface SmallScreenBottomNavigatorProps {
  geospaceNamespace: string;
  setGeospaceNamespace: (namespace: string) => void;
  areSpeedFiltersOpen: boolean;
  setAreSpeedFiltersOpen: (value: boolean) => void;
  speedType: string;
  selectedSpeedFilters: Array<string>;
  setSelectedSpeedFilters: (filters: Array<string>) => void;
  isRightPanelOpen: boolean;
  isRightPanelHidden: boolean;
}

const SmallScreenBottomNavigator = ({
  geospaceNamespace,
  setGeospaceNamespace,
  areSpeedFiltersOpen,
  setAreSpeedFiltersOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters,
  isRightPanelOpen,
  isRightPanelHidden
}: SmallScreenBottomNavigatorProps): ReactElement => {
  return (
    <div style={styles.SmallScreenBottomNavigatorContainer}>
      <SmallGeographicalCategoryTabs namespace={geospaceNamespace}
                                     selectNamespace={setGeospaceNamespace}
                                     isRightPanelOpen={isRightPanelOpen}
                                     isRightPanelHidden={isRightPanelHidden}
      />
      <SmallSpeedFilters isOpen={areSpeedFiltersOpen}
                         setIsOpen={setAreSpeedFiltersOpen}
                         speedType={speedType}
                         selectedSpeedFilters={selectedSpeedFilters}
                         setSelectedSpeedFilters={setSelectedSpeedFilters}
                         isRightPanelOpen={isRightPanelOpen}
                         isRightPanelHidden={isRightPanelHidden}
      />
    </div>
  )
}

export default SmallScreenBottomNavigator;