import {ReactElement} from "react";
import {styles} from "./styles/ExplorationPopoverIcon.style";
import PopoverClosedIcon from '../../../assets/popover-closed-icon.png';

interface ExplorationPopoverProps {
  openPopover: () => void;
}

const ExplorationPopoverIcon = ({openPopover}: ExplorationPopoverProps): ReactElement => {
  return (
    <div style={styles.ExplorationPopoverIconContainer} onClick={openPopover}>
      <img src={PopoverClosedIcon} style={styles.Icon} alt={'popover-closed-icon'}/>
    </div>
  )
}

export default ExplorationPopoverIcon;