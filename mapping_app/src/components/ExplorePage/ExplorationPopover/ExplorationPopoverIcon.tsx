import {ReactElement} from "react";
import {styles} from "./styles/ExplorationPopoverIcon.style";
import PopoverClosedIconWhite from '../../../assets/popover-icon-white.png';
import PopoverClosedIconBlack from '../../../assets/popover-icon-black.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface ExplorationPopoverProps {
  onClick: () => void;
  isOpen?: boolean;
}

const ExplorationPopoverIcon = ({
  onClick,
  isOpen,
}: ExplorationPopoverProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen} = useViewportSizes();

  const shouldShowBlackIcon = isSmallScreen || (isSmallTabletScreen && !isOpen);

  return (
    <div style={styles.ExplorationPopoverIconContainer(isSmallScreen, isSmallTabletScreen, isOpen)}
         onClick={onClick}
    >
      <img src={shouldShowBlackIcon ? PopoverClosedIconBlack : PopoverClosedIconWhite}
           style={styles.Icon(isSmallScreen || isSmallTabletScreen)} alt={'popover-closed-icon'}
      />
    </div>
  )
}

export default ExplorationPopoverIcon;