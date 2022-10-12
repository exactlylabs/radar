import {CSSProperties} from "react";
import {
  BLACK,
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  SEARCHBAR_BOX_SHADOW_RGBA,
  SEARCHBAR_COLOR,
  TRANSPARENT,
  WHITE
} from "../../../../styles/colors";

const topSearchbarContainerStyle: CSSProperties = {
  width: '375px',
  height: '60px',
  borderRadius: '6px',
  backgroundColor: WHITE,
  boxShadow: `0 2px 10px -4px ${SEARCHBAR_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'absolute',
  top: '25px',
  left: '25px',
  zIndex: 1000,
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 105px)',
  color: BLACK,
  fontSize: '17px',
  backgroundColor: TRANSPARENT,
  border: 'none',
  paddingBottom: '3px',
  paddingRight: '10px',
}

const iconContainerStyle: CSSProperties = {
  width: '21px',
  marginRight: '9px',
  marginLeft: '20px',
}

const searchIconStyle: CSSProperties = {
  color: SEARCHBAR_COLOR,
  width: '100%',
}

const arrowContainerStyle: CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: '6px',
  backgroundColor: BLACK,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`
}

const arrowStyle: CSSProperties = {
  color: WHITE,
  fontSize: '25px',
}

export const styles = {
  TopSearchbarContainer: () => {
    return topSearchbarContainerStyle;
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
  ArrowContainer: () => {
    return arrowContainerStyle;
  },
  Arrow: () => {
    return arrowStyle;
  }
}