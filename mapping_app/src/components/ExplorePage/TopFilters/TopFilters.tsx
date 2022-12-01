import {ReactElement, useState} from "react";
import {styles} from "./styles/TopFilters.style";
import OpenFiltersButton from "./OpenFiltersButton";
import Filters from "./Filters";
import {Asn} from "../../../api/asns/types";

interface TopFiltersProps {
  isRightPanelOpen: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: string) => void;
  setCalendarType: (type: string) => void;
  setProvider: (type: Asn) => void;
  geospaceNamespace: string;
  speedType: string;
  calendarType: string;
  provider: Asn;
  openDatePicker: () => void;
  isRightPanelHidden: boolean;
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
  provider,
  openDatePicker,
  isRightPanelHidden
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
                 openDatePicker={openDatePicker}
                 isRightPanelHidden={isRightPanelHidden}
        />
      }
    </div>
  )
}

export default TopFilters;