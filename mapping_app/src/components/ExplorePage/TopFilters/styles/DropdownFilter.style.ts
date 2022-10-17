import {CSSProperties} from "react";
import {BLACK, DEFAULT_TEXT, SELECTED_TAB} from "../../../../styles/colors";

const dropdownFilterContainerStyle: CSSProperties = {
  width: '31%',
  marginLeft: '5px',
  marginRight: '5px',
  position: 'relative',
  zIndex: 1050,
}

const filterContentContainerStyle: CSSProperties = {
  width: '100%',
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

export const styles = {
  DropdownFilterContainer: dropdownFilterContainerStyle,
  FilterContentContainer: (isOpen: boolean) => {
    return isOpen ? openFilterContentContainerStyle : filterContentContainerStyle;
  },
  Arrow: arrowStyle,
  Text: (textWidth: string) => {
    return {...textStyle, width: textWidth};
  },
  Icon: iconStyle,
}