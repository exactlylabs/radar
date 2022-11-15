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
  bottom: '150px',
  left: undefined,
  right: '15px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM
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
  ExplorationPopoverIconContainer: (isSmall: boolean) => {
    return isSmall ? smallExplorationPopoverIconContainerStyle : explorationPopoverIconContainerStyle;
  },
  Icon: (isSmall: boolean) => {
    return isSmall ? smallIconStyle : iconStyle;
  }
}