import {CSSProperties} from "react";
import {BLACK, DEFAULT_TEXT} from "../../../../styles/colors";

const dropdownFilterContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'relative',
  marginLeft: '10px',
  marginRight: '10px',
  zIndex: 1050,
}

const arrowStyle: CSSProperties = {
  color: DEFAULT_TEXT
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  color: BLACK,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

export const styles = {
  DropdownFilterContainer: dropdownFilterContainerStyle,
  Arrow: arrowStyle,
  Text: (textWidth: string) => {
    return {...textStyle, width: textWidth};
  }
}