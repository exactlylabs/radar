import {CSSProperties} from "react";
import {
  DEFAULT_SECONDARY_BLACK,
  EXPLORATION_POPOVER_BLACK,
  EXPLORATION_POPOVER_SECONDARY_BLACK, TRANSPARENT,
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

const transparentShrinkButtonContainerStyle: CSSProperties = {
  ...shrinkButtonContainerStyle,
  backgroundColor: TRANSPARENT
}

const arrowStyle: CSSProperties = {
  width: '22px',
  color: WHITE,
  opacity: 0.8
};

const smallStyle: CSSProperties = {
  ...explorationPopoverContainerStyle,
  width: '345px',
  height: '330px',
  bottom: '25px',
  left: '50%',
  marginLeft: '-172.5px'
}

const extendedSmallStyle: CSSProperties = {
  ...extendedExplorationPopoverContainerStyle,
  width: '345px',
  bottom: '25px',
  left: '50%',
  marginLeft: '-172.5px'
}

export const styles = {
  ExplorationPopoverContainer: (currentPopoverState: string, isSmall: boolean) => {
    let style = explorationPopoverContainerStyle;
    if(!isSmall && currentPopoverState !== popoverStates.INITIAL) style = extendedExplorationPopoverContainerStyle;
    else if(isSmall && currentPopoverState === popoverStates.INITIAL) style = smallStyle;
    else if(isSmall && currentPopoverState !== popoverStates.INITIAL) style = extendedSmallStyle;
    return style;
  },
  ShrinkButtonContainer: (isSmall: boolean) => {
    return isSmall ? transparentShrinkButtonContainerStyle : shrinkButtonContainerStyle;
  },
  Arrow: arrowStyle,
  ClosedExplorationPopoverContainer: closedExplorationPopoverContainerStyle,
}