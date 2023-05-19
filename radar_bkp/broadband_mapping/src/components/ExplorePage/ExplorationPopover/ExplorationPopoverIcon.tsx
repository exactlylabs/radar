import {ReactElement} from "react";
import {styles} from "./styles/ExplorationPopoverIcon.style";
import PopoverClosedIconWhite from '../../../assets/popover-icon-white.png';
import PopoverClosedIconBlack from '../../../assets/popover-icon-black.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface ExplorationPopoverProps {
  onClick: () => void;
  isOpen?: boolean;
  isRightPanelOpen: boolean;
  isRightPanelHidden: boolean;
}

const ExplorationPopoverIcon = ({
  onClick,
  isOpen,
  isRightPanelOpen,
  isRightPanelHidden
}: ExplorationPopoverProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen, isLargeTabletScreen} = useViewportSizes();
  const isTablet = isSmallTabletScreen || isLargeTabletScreen;

  const shouldShowBlackIcon = isSmallScreen || (isTablet && !isOpen);

  return (
    <div style={styles.ExplorationPopoverIconContainer(isSmallScreen, isSmallTabletScreen, isLargeTabletScreen, isRightPanelOpen, isRightPanelHidden, isOpen)}
         onClick={onClick}
    >
      <img src={shouldShowBlackIcon ? PopoverClosedIconBlack : PopoverClosedIconWhite}
           style={styles.Icon(isSmallScreen || isSmallTabletScreen)} alt={'popover-closed-icon'}
      />
    </div>
  )
}

export default ExplorationPopoverIcon;