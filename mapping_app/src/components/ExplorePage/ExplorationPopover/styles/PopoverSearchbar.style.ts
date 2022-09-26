import {CSSProperties} from "react";
import {
  CLEAR_ICON_COLOR,
  POPOVER_OPTION_LIGHT_BOX_SHADOW_RGBA,
  SEARCHBAR_COLOR,
  TRANSPARENT,
  WHITE
} from "../../../../styles/colors";

const popoverSearchbarContainerStyle: CSSProperties = {
  width: '100%',
  marginTop: '25px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderBottom: `solid 1px ${POPOVER_OPTION_LIGHT_BOX_SHADOW_RGBA}`,
  paddingBottom: '10px',
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 21px)',
  color: WHITE,
  fontFamily: 'OutfitLight',
  fontSize: '17px',
  backgroundColor: TRANSPARENT,
  border: 'none',
  paddingBottom: '3px',
}

const iconContainerStyle: CSSProperties = {
  width: '21px',
  marginRight: '9px',
}

const searchIconStyle: CSSProperties = {
  color: SEARCHBAR_COLOR,
  width: '100%',
}

const clearIconContainerStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const clearIconStyle: CSSProperties = {
  color: CLEAR_ICON_COLOR,
  fontSize: '15px',
  marginRight: '20px'
}

export const styles = {
  PopoverSearchbarContainer: () => {
    return popoverSearchbarContainerStyle;
  },
  Input: () => {
    return inputStyle;
  },
  IconContainer: () => {
    return iconContainerStyle;
  },
  SearchIcon: () => {
    return searchIconStyle;
  },
  ClearIconContainer: () => {
    return clearIconContainerStyle;
  },
  ClearIcon: () => {
    return clearIconStyle;
  }
}