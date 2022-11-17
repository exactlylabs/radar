import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, DEFAULT_SECONDARY_BUTTON,} from "../../../../styles/colors";

const dropdownFiltersContainerStyle: CSSProperties = {
  width: 'max-content',
  minWidth: '445px',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  marginRight: '10px',
  marginLeft: '10px',
  backdropFilter: 'blur(10px)',
  zIndex: 1002,
}

const smallDropdownFiltersContainerStyle: CSSProperties = {
  width: 'calc(100vw - 30px)',
  minWidth: '250px',
  maxWidth: '420px',
  height: '50px',
  position: 'absolute',
  top: '82px',
  left: '15px',
  zIndex: 1010,
  overflowX: 'scroll',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const smallTabletDropdownFiltersContainerStyle: CSSProperties = {
  ...smallDropdownFiltersContainerStyle,
  maxWidth: '380px'
}

const largeTabletDropdownFiltersContainerStyle: CSSProperties = {
  ...smallDropdownFiltersContainerStyle,
  maxWidth: '380px',
  top: '20px',
  right: '25px',
  left: undefined
}

const largeTabletAndInContainer: CSSProperties = {
  maxWidth: '420px',
}

const insideContainerStyle: CSSProperties = {
  position: 'relative',
  margin: 0,
  top: undefined,
  left: undefined
}

export const styles = {
  DropdownFiltersContainer: (isSmall: boolean, isSmallTablet: boolean, isLargeTablet: boolean, isInsideContainer?: boolean) => {
    let style;
    if(isSmall) style = smallDropdownFiltersContainerStyle;
    else if(isSmallTablet) style = smallTabletDropdownFiltersContainerStyle;
    else if(isLargeTablet) style = largeTabletDropdownFiltersContainerStyle;
    //else if(isLargeAndInRightPanel) style = largeTabletAndInRightPanelDropdownFiltersContainerStyle;
    else style = dropdownFiltersContainerStyle;
    if(!isInsideContainer) return style;
    if(isLargeTablet) style = {...style, ...largeTabletAndInContainer};
    return {...style, ...insideContainerStyle};
  },
}