import {ReactElement} from "react";
import {styles} from "./styles/TopFilters.style";
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

  return (
    <div style={styles.TopFiltersContainer(isRightPanelOpen)}>
      <Filters extendedView={!isRightPanelOpen}
               setGeospaceNamespace={setGeospaceNamespace}
               setSpeedType={setSpeedType}
               setCalendarType={setCalendarType}
               setProvider={setProvider}
               geospaceNamespace={geospaceNamespace}
               speedType={speedType}
               calendarType={calendarType}
               provider={provider}
      />
    </div>
  )
}

export default TopFilters;