import {CSSProperties} from "react";
import {EXPLORATION_POPOVER_BLACK, EXPLORATION_POPOVER_SECONDARY_BLACK} from "../../../../styles/colors";

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
  zIndex: 1000,
}

const iconStyle: CSSProperties = {
  width: '24px',
  height: '24px',
}

export const styles = {
  ExplorationPopoverIconContainer: () => {
    return explorationPopoverIconContainerStyle;
  },
  Icon: () => {
    return iconStyle;
  }
}