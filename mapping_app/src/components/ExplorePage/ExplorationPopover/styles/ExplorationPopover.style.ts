import {CSSProperties} from "react";
import {
  DEFAULT_SECONDARY_BLACK,
  EXPLORATION_POPOVER_BLACK,
  EXPLORATION_POPOVER_SECONDARY_BLACK,
  WHITE
} from "../../../../styles/colors";
import {popoverStates} from "../ExplorationPopover";

const explorationPopoverContainerStyle: CSSProperties = {
  width: '375px',
  height: '365px',
  backgroundColor: EXPLORATION_POPOVER_BLACK,
  boxShadow: `0 2px 10px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
  borderRadius: '6px',
  position: 'absolute',
  bottom: '25px',
  left: '25px',
  zIndex: 1002,
  backdropFilter: 'blur(5px)'
}

const closedExplorationPopoverContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
}

const extendedExplorationPopoverContainerStyle: CSSProperties = {
  ...explorationPopoverContainerStyle,
  height: '540px',
}

const shrinkButtonContainerStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: DEFAULT_SECONDARY_BLACK,
  boxShadow: `0 4px 8px -4px${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
  borderRadius: '6px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const arrowStyle: CSSProperties = {
  width: '22px',
  color: WHITE,
  opacity: 0.8
};

const iconStyle: CSSProperties = {
  width: '24px',
  height: '24px',
}

const closedContainerStyle: CSSProperties = {
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

export const styles = {
  ExplorationPopoverContainer: (currentPopoverState: string, isOpen: boolean) => {
    if(!isOpen) return closedContainerStyle;
    return currentPopoverState === popoverStates.INITIAL ? explorationPopoverContainerStyle : extendedExplorationPopoverContainerStyle;
  },
  ShrinkButtonContainer: shrinkButtonContainerStyle,
  Arrow: arrowStyle,
  ClosedExplorationPopoverContainer: closedExplorationPopoverContainerStyle,
  Icon: iconStyle
}