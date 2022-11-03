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
  width: '345px',
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
  left: '50%',
  marginLeft: '-172.5px',
  zIndex: 1003,
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 95px)',
  color: BLACK,
  fontSize: '16px',
  backgroundColor: TRANSPARENT,
  border: 'none',
  paddingBottom: '3px',
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

export const styles = {
  SmallScreenSearchbarContainer: smallScreenSearchbarContainerStyle,
  Input: inputStyle,
  IconContainer: iconContainerStyle,
  SearchIcon: searchIconStyle,
  FiltersButton: (areFiltersOpen: boolean) => {
    return areFiltersOpen ? openFiltersButtonStyle : filtersButtonStyle;
  },
  FiltersIcon: filtersIconStyle,
}