import {ReactElement} from "react";
import LayersIconBlack from '../../../../assets/layers-icon.png';
import LayersIconWhite from '../../../../assets/layers-icon-white.png';
import {styles} from "./styles/SmallSpeedFilters.style";
import OpenSmallSpeedFilters from "./OpenSmallSpeedFilters";
import {Filter} from "../../../../utils/types";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

interface SmallSpeedFiltersProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  speedType: string;
  selectedSpeedFilters: Array<Filter>;
  setSelectedSpeedFilters: (filters: Array<Filter>) => void;
  isRightPanelOpen: boolean;
}

const SmallSpeedFilters = ({
  isOpen,
  setIsOpen,
  speedType,
  selectedSpeedFilters,
  setSelectedSpeedFilters,
  isRightPanelOpen
}: SmallSpeedFiltersProps): ReactElement => {

  const {isSmallTabletScreen, isLargeTabletScreen} = useViewportSizes();

  const toggleFilters = () => setIsOpen(!isOpen);

  return (
    <div style={styles.SmallSpeedFiltersContainer}>
      <div className={'hover-opaque'} style={styles.Button(isOpen, isSmallTabletScreen, isLargeTabletScreen, isRightPanelOpen)} onClick={toggleFilters}>
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