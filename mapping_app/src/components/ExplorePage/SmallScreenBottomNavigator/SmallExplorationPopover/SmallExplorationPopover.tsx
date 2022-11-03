import {ReactElement} from "react";
import {GeospaceOverview} from "../../../../api/geospaces/types";
import PopoverIconWhite from "../../../../assets/popover-icon-white.png";
import PopoverIconBlack from "../../../../assets/popover-icon-black.png";
import ExplorationPopover from "../../ExplorationPopover/ExplorationPopover";
import {styles} from "./styles/SmallExplorationPopover.style";

interface SmallExplorationPopoverProps {
  selectGeospace: (geospace: GeospaceOverview) => void;
  recenterMap: () => void;
  setCenter: (center: Array<number>) => void;
  setZoom: (zoom: number) => void;
  isExplorationPopoverOpen: boolean;
  setIsExplorationPopoverOpen: (value: boolean) => void;
  setGeospaceNamespace: (namespace: string) => void;
}

const SmallExplorationPopover = ({
  selectGeospace,
  recenterMap,
  setCenter,
  setZoom,
  isExplorationPopoverOpen,
  setIsExplorationPopoverOpen,
  setGeospaceNamespace
}: SmallExplorationPopoverProps): ReactElement => {

  const togglePopover = () => setIsExplorationPopoverOpen(!isExplorationPopoverOpen);
  const closePopover = () => setIsExplorationPopoverOpen(false);

  return (
    <div>
      <div className={'hover-opaque'} style={styles.Button(isExplorationPopoverOpen)} onClick={togglePopover}>
        <img src={isExplorationPopoverOpen ? PopoverIconWhite : PopoverIconBlack} style={styles.ExplorationIcon} alt={'layers-icon'}/>
      </div>
      { isExplorationPopoverOpen &&
        <ExplorationPopover closePopover={closePopover}
                            selectGeospace={selectGeospace}
                            setGeospaceNamespace={setGeospaceNamespace}
                            recenterMap={recenterMap}
                            setCenter={setCenter}
                            setZoom={setZoom}
                            isOpen={isExplorationPopoverOpen}
                            setIsOpen={setIsExplorationPopoverOpen}
        />
      }
    </div>
  )
}

export default SmallExplorationPopover;