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

const smallOptionStyle: CSSProperties = {
  ...optionStyle,
  height: '48px',
  minHeight: '48px',
}

const extraMargin: CSSProperties = {
  marginTop: '5px',
  marginBottom: '5px',
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
  Option: (isSmall: boolean, hasHorizontalDivider: boolean) => {
    let style = isSmall ? smallOptionStyle : optionStyle;
    return hasHorizontalDivider ? {...style, ...extraMargin} : style;
  },
  Icon: iconStyle,
  Text: (selected: boolean, isSmall: boolean) => {
    let style = selected ? selectedTextStyle : textStyle;
    return isSmall ? {...style, fontSize: '16px'} : style;
  }
}