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
  width: '345px',
  height: '50px',
  position: 'absolute',
  top: '82px',
  left: '50%',
  marginLeft: '-172.5px',
  zIndex: 1010,
  overflowX: 'scroll',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const insideContainerStyle: CSSProperties = {
  position: 'relative',
  margin: 0,
  top: undefined,
  left: undefined
}

export const styles = {
  DropdownFiltersContainer: (isSmall: boolean, isInsideContainer?: boolean) => {
    let style = isSmall ? smallDropdownFiltersContainerStyle : dropdownFiltersContainerStyle;
    if(!isInsideContainer) return style;
    return {...style, ...insideContainerStyle};
  },
}