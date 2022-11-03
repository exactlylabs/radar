import {ReactElement} from "react";
import {styles} from "./styles/ExplorationPopoverIcon.style";
import PopoverClosedIconWhite from '../../../assets/popover-icon-white.png';
import PopoverClosedIconBlack from '../../../assets/popover-icon-black.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface ExplorationPopoverProps {
  openPopover: () => void;
}

const ExplorationPopoverIcon = ({openPopover}: ExplorationPopoverProps): ReactElement => {

  const {isSmallerThanMid} = useViewportSizes();

  return (
    <div style={styles.ExplorationPopoverIconContainer(isSmallerThanMid)} onClick={openPopover}>
      <img src={isSmallerThanMid ? PopoverClosedIconBlack : PopoverClosedIconWhite}
           style={styles.Icon(isSmallerThanMid)} alt={'popover-closed-icon'}
      />
    </div>
  )
}

export default ExplorationPopoverIcon;