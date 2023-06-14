import {CSSProperties} from "react";
import {
  CLOSE_PANEL_BUTTON_SHADOW_RGBA,
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
  zIndex: 1100,
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

const  shrinkButtonContainerStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: DEFAULT_SECONDARY_BLACK,
  boxShadow: `0 4px 8px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
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

const smallArrowStyle: CSSProperties = {
  width: '26px',
}

const smallStyle: CSSProperties = {
  ...explorationPopoverContainerStyle,
  width: '345px',
  height: '330px',
  bottom: '25px',
  left: '50%',
  marginLeft: '-172.5px'
}

const smallTabletStyle: CSSProperties = {
  ...smallStyle,
  height: '370px',
  top: '50%',
  marginTop: '-185px',
  bottom: undefined,
}

const extendedSmallStyle: CSSProperties = {
  ...extendedExplorationPopoverContainerStyle,
  width: '345px',
  bottom: '25px',
  left: '50%',
  marginLeft: '-172.5px'
}

const extendedSmallTabletStyle: CSSProperties = {
  ...extendedSmallStyle,
  top: '50%',
  marginTop: '-270px',
  left: '50%',
  marginLeft: '-172.5px'
}

const shadowStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  backgroundColor: CLOSE_PANEL_BUTTON_SHADOW_RGBA,
  zIndex: 1099,
  position: 'fixed',
  top: 0,
  left: 0
}

export const styles = {
  ExplorationPopoverContainer: (currentPopoverState: string, isSmall: boolean, isSmallTablet: boolean, isLargeTablet: boolean) => {
    let style = explorationPopoverContainerStyle;
    const isTablet = isSmallTablet || isLargeTablet;
    const isBigScreen = !isSmall && !isSmallTablet && !isLargeTablet;
    if(isBigScreen && currentPopoverState !== popoverStates.INITIAL) style = extendedExplorationPopoverContainerStyle;
    else if(isSmall && currentPopoverState === popoverStates.INITIAL) style = smallStyle;
    else if(isSmall && currentPopoverState !== popoverStates.INITIAL) style = extendedSmallStyle;
    else if(isTablet && currentPopoverState === popoverStates.INITIAL) style = smallTabletStyle;
    else if(isTablet && currentPopoverState !== popoverStates.INITIAL) style = extendedSmallTabletStyle;
    return style;
  },
  ShrinkButtonContainer: (isSmall: boolean) => {
    return isSmall ? transparentShrinkButtonContainerStyle : shrinkButtonContainerStyle;
  },
  Arrow: (isSmall: boolean) => isSmall ? smallArrowStyle : arrowStyle,
  ClosedExplorationPopoverContainer: closedExplorationPopoverContainerStyle,
  Shadow: shadowStyle,
}