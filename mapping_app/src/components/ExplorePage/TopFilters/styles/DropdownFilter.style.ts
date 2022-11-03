import {CSSProperties} from "react";
import {
  BLACK,
  CLOSE_PANEL_BUTTON_SHADOW_RGBA,
  DEFAULT_TEXT,
  GEOGRAPHICAL_CATEGORY_BOTTOM,
  SELECTED_TAB
} from "../../../../styles/colors";

const dropdownFilterContainerStyle: CSSProperties = {
  width: '31%',
  marginLeft: '5px',
  marginRight: '5px',
  position: 'relative',
  zIndex: 1010,
}

const smallDropdownFilterContainerStyle: CSSProperties = {
  width: '132px',
  position: 'relative',
  zIndex: 1010,
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM,
  borderRadius: '6px',
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  marginRight: '8px',
}

const filterContentContainerStyle: CSSProperties = {
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '10px 5px',
  borderRadius: '8px',
}

const openFilterContentContainerStyle: CSSProperties = {
  ...filterContentContainerStyle,
  backgroundColor: SELECTED_TAB,
}

const arrowStyle: CSSProperties = {
  width: '12px',
  height: '8px',
  color: DEFAULT_TEXT,
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  color: BLACK,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const iconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  minWidth: '18px',
  minHeight: '18px',
  marginRight: '5px',
}

const smallStyle: CSSProperties = {
  width: '132px',
}

export const styles = {
  DropdownFilterContainer: (isSmall: boolean, isLast?: boolean) => {
    let style = isSmall ? smallDropdownFilterContainerStyle : dropdownFilterContainerStyle;
    return isLast ? {...style, marginRight: 0} : style;
  },
  FilterContentContainer: (isOpen: boolean, isSmall: boolean) => {
    let style = isOpen ? openFilterContentContainerStyle : filterContentContainerStyle;
    return isSmall ? {...style, ...smallStyle} : style;
  },
  Arrow: arrowStyle,
  Text: (textWidth: string) => {
    return {...textStyle, width: textWidth};
  },
  Icon: iconStyle,
}