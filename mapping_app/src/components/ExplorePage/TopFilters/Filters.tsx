import {ReactElement, useState} from "react";
import {styles} from "./styles/Filters.style";
import GeographicalCategoryTabs from "./GeographicalCategoryTabs";
import DropdownFilters from "./DropdownFilters";
import {Filter} from "../../../utils/types";
import {AnimatePresence, motion} from "framer-motion";
import ToggleFiltersButton from "./ToggleFiltersButton";

interface FiltersProps {
  extendedView: boolean;
  setGeospaceNamespace: (namespace: string) => void;
  setSpeedType: (type: Filter) => void;
  setCalendarType: (type: Filter) => void;
  setProvider: (type: Filter) => void;
  geospaceNamespace: string;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
}

const Filters = ({
  extendedView,
  setGeospaceNamespace,
  setSpeedType,
  setCalendarType,
  setProvider,
  geospaceNamespace,
  speedType,
  calendarType,
  provider
}: FiltersProps): ReactElement => {

  const animationDuration = 1;
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [openContent, setOpenContent] = useState(true);

  const toggleContent = () => setOpenContent(!openContent);

  const toggleFilters = () => {
    setTimeout(() => toggleContent(), animationDuration * 1000);
    setFiltersOpen(!filtersOpen);
  }

  const handleChangeFilters = (filters: Array<Filter>) => {
    setSpeedType(filters[0]);
    setCalendarType(filters[1]);
    setProvider(filters[2]);
  }

  return (
    <div style={styles.FiltersContainer}>
      <AnimatePresence>
      {
        filtersOpen &&
          <motion.div initial={{ opacity: 0, left: extendedView ? -720 : -250 }}
                      exit={{ opacity: 0, left: extendedView ? -720 : -250 }}
                      animate={{ opacity: 1, left: extendedView ? -730 : -260 }}
                      transition={{ duration: animationDuration }}
                      style={styles.AnimatedContainer(extendedView)}
          >
            <GeographicalCategoryTabs geospaceNamespace={geospaceNamespace}
                                      setGeospaceNamespace={setGeospaceNamespace}
            />
            {
              extendedView &&
              <div style={styles.ConditionalFiltersContainer}>
                <DropdownFilters changeFilters={handleChangeFilters}
                                 speedType={speedType}
                                 calendarType={calendarType}
                                 provider={provider}
                />
              </div>
            }
          </motion.div>
      }
      </AnimatePresence>
      {
        extendedView &&
        <ToggleFiltersButton toggleFilters={toggleFilters} openContent={openContent}/>
      }
    </div>
  )
}

export default Filters;