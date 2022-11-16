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
  width: 'max-content',
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
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '10px 5px',
  borderRadius: '8px',
}

const smallContentContainerStyle: CSSProperties = {
  ...filterContentContainerStyle,
  minWidth: undefined,
  padding: '10px 15px',
}

const openFilterContentContainerStyle: CSSProperties = {
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

export const styles = {
  DropdownFilterContainer: (isSmall: boolean, isLast?: boolean) => {
    let style = isSmall ? smallDropdownFilterContainerStyle : dropdownFilterContainerStyle;
    return isLast ? {...style, marginRight: 0} : style;
  },
  FilterContentContainer: (isOpen: boolean, isSmall: boolean) => {
    let style = isSmall ? smallContentContainerStyle : filterContentContainerStyle;
    return isOpen ? {...style, ...openFilterContentContainerStyle} : style;
  },
  Arrow: arrowStyle,
  Text: (textWidth: string) => {
    return {...textStyle, width: textWidth};
  },
  Icon: iconStyle,
}