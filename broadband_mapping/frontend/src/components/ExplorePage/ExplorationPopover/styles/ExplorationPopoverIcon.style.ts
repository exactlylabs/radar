import {CSSProperties} from "react";
import {
  EXPLORATION_POPOVER_BLACK,
  EXPLORATION_POPOVER_SECONDARY_BLACK,
  GEOGRAPHICAL_CATEGORY_BOTTOM
} from "../../../../styles/colors";

const explorationPopoverIconContainerStyle: CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: '6px',
  backgroundColor: EXPLORATION_POPOVER_BLACK,
  boxShadow: `0 2px 10px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'absolute',
  bottom: '25px',
  left: '25px',
  zIndex: 1002,
}

const smallExplorationPopoverIconContainerStyle: CSSProperties = {
  ...explorationPopoverIconContainerStyle,
  width: '48px',
  height: '48px',
  bottom: '152px',
  left: undefined,
  right: '15px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM
}

const smallTabletExplorationPopoverIconContainerStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '93px',
}

const largeTabletExplorationPopoverIconContainerStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '152px',
  left: 'calc(100vw - 47px - 25px)'
}

const largeTabletExplorationPopoverIconContainerRightPanelOpenStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '152px',
  left: 'calc(100vw - 47px - 25px - 497px)'
}

const openSmallTabletExplorationPopoverIconContainerStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '93px',
  backgroundColor: EXPLORATION_POPOVER_BLACK,
}

const openLargeTabletExplorationPopoverIconContainerStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '152px',
  left: 'calc(100vw - 47px - 25px)',
  backgroundColor: EXPLORATION_POPOVER_BLACK
}

const openLargeTabletExplorationPopoverIconContainerRightPanelOpenStyle: CSSProperties = {
  ...smallExplorationPopoverIconContainerStyle,
  bottom: '145px',
  left: 'calc(100vw - 47px - 25px - 497px)',
  backgroundColor: EXPLORATION_POPOVER_BLACK
}

const iconStyle: CSSProperties = {
  width: '24px',
  height: '24px',
}

const smallIconStyle: CSSProperties = {
  width: '20px',
  height: '20px'
}

export const styles = {
  ExplorationPopoverIconContainer: (isSmall: boolean, isSmallTablet: boolean, isLargeTablet: boolean, isRightPanelOpen: boolean, isRightPanelHidden: boolean, isOpen?: boolean) => {
    let style;
    if(isSmall && !isOpen) style = smallExplorationPopoverIconContainerStyle;
    else if(isSmallTablet && !isOpen) style = smallTabletExplorationPopoverIconContainerStyle;
    else if(isSmallTablet && isOpen) style = openSmallTabletExplorationPopoverIconContainerStyle;
    else if(isLargeTablet && !isOpen && (!isRightPanelOpen || isRightPanelHidden)) style = largeTabletExplorationPopoverIconContainerStyle;
    else if(isLargeTablet && isOpen && (!isRightPanelOpen || isRightPanelHidden)) style = openLargeTabletExplorationPopoverIconContainerStyle;
    else if(isLargeTablet && !isOpen && isRightPanelOpen && !isRightPanelHidden) style = largeTabletExplorationPopoverIconContainerRightPanelOpenStyle;
    else if(isLargeTablet && isOpen && isRightPanelOpen && !isRightPanelHidden) style = openLargeTabletExplorationPopoverIconContainerRightPanelOpenStyle;
    else style = explorationPopoverIconContainerStyle;
    return style;
  },
  Icon: (isSmall: boolean) => {
    return isSmall ? smallIconStyle : iconStyle;
  }
}