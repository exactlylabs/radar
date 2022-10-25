import {CSSProperties} from "react";
import {DEFAULT_GREEN, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../styles/colors";

const optionStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  minWidth: '135px',
  height: '40px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: '15px',
  marginRight: '15px',
  position: 'relative',
  cursor: 'pointer',
}

const iconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  color: DEFAULT_GREEN,
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const selectedTextStyle: CSSProperties = {
  ...textStyle,
  color: DEFAULT_TEXT,
}

export const styles = {
  Option: optionStyle,
  Icon: iconStyle,
  Text: (selected: boolean) => {
    return selected ? selectedTextStyle : textStyle;
  }
}