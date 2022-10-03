import {CSSProperties} from "react";
import {
  DEFAULT_SECONDARY_BLACK,
  EXPLORATION_POPOVER_BLACK,
  EXPLORATION_POPOVER_SECONDARY_BLACK, WHITE
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
  zIndex: 1000,
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
  transform: 'rotate(180deg)',
  color: WHITE,
  opacity: 0.8
};

export const styles = {
  ExplorationPopoverContainer: (currentPopoverState: string) => {
    return currentPopoverState === popoverStates.INITIAL ? explorationPopoverContainerStyle : extendedExplorationPopoverContainerStyle;
  },
  ShrinkButtonContainer: () => {
    return shrinkButtonContainerStyle;
  },
  Arrow: () => {
    return arrowStyle;
  }
}