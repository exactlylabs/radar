import {ReactElement} from "react";
import LayersIconBlack from '../../../../assets/layers-icon.png';
import LayersIconWhite from '../../../../assets/layers-icon-white.png';
import {styles} from "./styles/SmallSpeedFilters.style";
import OpenSmallSpeedFilters from "./OpenSmallSpeedFilters";

interface SmallSpeedFiltersProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  speedType: string;
  selectedSpeedFilters: Array<string>;
  setSelectedSpeedFilters: (filters: Array<string>) => void;
}

const SmallSpeedFilters = ({
  isOpen,
  setIsOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters
}: SmallSpeedFiltersProps): ReactElement => {

  const toggleFilters = () => setIsOpen(!isOpen);

  return (
    <div style={styles.SmallSpeedFiltersContainer}>
      <div className={'hover-opaque'} style={styles.Button(isOpen)} onClick={toggleFilters}>
        <img src={isOpen ? LayersIconWhite : LayersIconBlack} style={styles.LayersIcon} alt={'layers-icon'}/>
      </div>
      { isOpen &&
        <OpenSmallSpeedFilters speedType={speedType}
                               selectedSpeedFilters={selectedSpeedFilters}
                               setSelectedSpeedFilters={setSelectedSpeedFilters}
        />
      }
    </div>
  )
}

export default SmallSpeedFilters;