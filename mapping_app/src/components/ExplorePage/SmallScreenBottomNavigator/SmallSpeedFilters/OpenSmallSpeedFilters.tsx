import {ReactElement} from "react";
import {styles} from "./styles/OpenSmallSpeedFilters.style";
import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../../../../styles/colors";
import {speedTextsDownload, speedTextsUpload, speedTypes} from "../../../../utils/speeds";
import SpeedFilter from "../../SpeedFilters/SpeedFilter";
import {SpeedFilters} from "../../../../utils/filters";

interface OpenSmallSpeedFiltersProps {
  speedType: string;
  selectedSpeedFilters: Array<string>;
  setSelectedSpeedFilters: (filters: Array<string>) => void;
}

const OpenSmallSpeedFilters = ({
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters
}: OpenSmallSpeedFiltersProps): ReactElement => {

  const toggleFilter = (filter: string) => {
    let elements = [...selectedSpeedFilters];
    if(selectedSpeedFilters.includes(filter)) {
      const index = elements.indexOf(filter);
      elements.splice(index, 1);
    } else {
      elements.push(filter);
    }
    setSelectedSpeedFilters(elements);
  }

  const toggleUnserved = () => toggleFilter(speedTypes.UNSERVED);

  const toggleUnderserved = () => toggleFilter(speedTypes.UNDERSERVED);

  const toggleNormal = () => toggleFilter(speedTypes.SERVED);

  return (
    <div style={styles.OpenSmallSpeedFiltersContainer}>
      <div style={styles.SpeedFiltersContainer}>
        <SpeedFilter boxColor={SPEED_UNSERVED}
                     text={speedType === SpeedFilters.DOWNLOAD ? speedTextsDownload.UNSERVED : speedTextsUpload.UNSERVED}
                     secondaryText={'(Unserved)'}
                     isChecked={selectedSpeedFilters.includes(speedTypes.UNSERVED)}
                     toggleFilter={toggleUnserved}
        />
      </div>
      <div style={styles.SpeedFiltersContainer}>
        <SpeedFilter boxColor={SPEED_UNDERSERVED}
                     text={speedType === SpeedFilters.DOWNLOAD ? speedTextsDownload.UNDERSERVED : speedTextsUpload.UNDERSERVED}
                     secondaryText={'(Underserved)'}
                     isChecked={selectedSpeedFilters.includes(speedTypes.UNDERSERVED)}
                     toggleFilter={toggleUnderserved}
        />
      </div>
      <div style={styles.SpeedFiltersContainer}>
        <SpeedFilter boxColor={SPEED_NORMAL}
                     text={speedType === SpeedFilters.DOWNLOAD ? speedTextsDownload.SERVED : speedTextsUpload.SERVED}
                     isChecked={selectedSpeedFilters.includes(speedTypes.SERVED)}
                     toggleFilter={toggleNormal}
        />
      </div>
    </div>
  )
}

export default OpenSmallSpeedFilters;