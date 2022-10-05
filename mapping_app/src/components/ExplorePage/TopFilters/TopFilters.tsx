import {ReactElement, useState} from "react";
import {styles} from "./styles/TopFilters.style";
import OpenFiltersButton from "./OpenFiltersButton";
import Filters from "./Filters";
import {Filter} from "../../../utils/types";

interface TopFiltersProps {
  isRightPanelOpen: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: Filter) => void;
  setCalendarType: (type: Filter) => void;
  setProvider: (type: Filter) => void;
  geospaceNamespace: string;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
}

const TopFilters = ({
  isRightPanelOpen,
  setGeospaceNamespace,
  setSpeedType,
  setCalendarType,
  setProvider,
  geospaceNamespace,
  speedType,
  calendarType,
  provider
}: TopFiltersProps): ReactElement => {

  const [filtersOpen, setFiltersOpen] = useState(true);

  const openFilters = () => setFiltersOpen(true);

  const closeFilters = () => setFiltersOpen(false);

  return (
    <div style={styles.TopFiltersContainer(isRightPanelOpen)}>
      {!filtersOpen && <OpenFiltersButton openFilters={openFilters}/>}
      { filtersOpen &&
        <Filters closeFilters={closeFilters}
                 extendedView={!isRightPanelOpen}
                 setGeospaceNamespace={setGeospaceNamespace}
                 setSpeedType={setSpeedType}
                 setCalendarType={setCalendarType}
                 setProvider={setProvider}
                 geospaceNamespace={geospaceNamespace}
                 speedType={speedType}
                 calendarType={calendarType}
                 provider={provider}
        />
      }
    </div>
  )
}

export default TopFilters;