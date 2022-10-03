import {ReactElement, useState} from "react";
import {styles} from "./styles/TopFilters.style";
import OpenFiltersButton from "./OpenFiltersButton";
import Filters from "./Filters";

interface TopFiltersProps {
  isRightPanelOpen: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: string) => void;
  speedType: string;
  calendarType: string;
  provider: string;
}

const TopFilters = ({
  isRightPanelOpen,
  setGeospaceNamespace,
  setSpeedType,
  setCalendarType,
  setProvider,
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
                 speedType={speedType}
                 calendarType={calendarType}
                 provider={provider}
        />
      }
    </div>
  )
}

export default TopFilters;