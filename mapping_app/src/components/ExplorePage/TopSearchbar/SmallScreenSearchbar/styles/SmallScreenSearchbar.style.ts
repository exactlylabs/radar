import {CSSProperties} from "react";
import {
  BLACK,
  SEARCHBAR_BOX_SHADOW_RGBA,
  SEARCHBAR_COLOR,
  SELECTED_TABS,
  TRANSPARENT,
  WHITE
} from "../../../../../styles/colors";

const smallScreenSearchbarContainerStyle: CSSProperties = {
  width: 'calc(100vw - 30px)',
  minWidth: '250px',
  maxWidth: '420px',
  height: '52px',
  borderRadius: '6px',
  backgroundColor: WHITE,
  boxShadow: `0 2px 10px -4px ${SEARCHBAR_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'absolute',
  top: '15px',
  left: '15px',
  zIndex: 1003,
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 95px)',
  color: BLACK,
  fontSize: '16px',
  backgroundColor: TRANSPARENT,
  border: 'none',
  paddingRight: '10px',
}

const iconContainerStyle: CSSProperties = {
  width: '20px',
  marginRight: '9px',
  marginLeft: '15px',
}

const searchIconStyle: CSSProperties = {
  color: SEARCHBAR_COLOR,
  width: '100%',
}

const filtersButtonStyle: CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '6px',
  position: 'absolute',
  right: '7px',
  top: '9px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer'
}

const openFiltersButtonStyle: CSSProperties = {
  ...filtersButtonStyle,
  backgroundColor: SELECTED_TABS
}

const filtersIconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
}

const loaderStyle: CSSProperties = {
  height: '2px',
  backgroundColor: BLACK,
  borderRadius: '2.5px',
  position: 'absolute',
  bottom: 0,
  left: 0
}

const clearIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  position: 'absolute',
  right: '65px',
  top: '50%',
  marginTop: '-10px',
}

export const styles = {
  SmallScreenSearchbarContainer: smallScreenSearchbarContainerStyle,
  Input: inputStyle,
  IconContainer: iconContainerStyle,
  SearchIcon: searchIconStyle,
  FiltersButton: (areFiltersOpen: boolean) => {
    return areFiltersOpen ? openFiltersButtonStyle : filtersButtonStyle;
  },
  FiltersIcon: filtersIconStyle,
  Loader: (width: number) => {
    return {...loaderStyle, width: `${width}%`};
  },
  ClearIcon: clearIconStyle,
}