import {CSSProperties} from "react";
import {
  DEFAULT_GREEN,
  DEFAULT_SECONDARY_BLACK,
  DEFAULT_SECONDARY_TEXT, FOOTER_TEXT,
  TRANSPARENT,
  WHITE
} from "../../../../styles/colors";

const weekPickerRowStyle: CSSProperties = {
  width: '236px',
  height: '32px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
}

const smallRowStyle: CSSProperties = {
  width: '100%',
  height: '32px',
  marginTop: '4px',
  marginBottom: '4px'
}

const regularRowStyle: CSSProperties = {
  width: '236px',
  height: '32px',
}

const headerWeekPickerRowStyle: CSSProperties = {
  ...weekPickerRowStyle,
  backgroundColor: TRANSPARENT,
}

const selectedWeekPickerRowStyle: CSSProperties = {
  ...weekPickerRowStyle,
  backgroundColor: DEFAULT_GREEN,
}

const textContainerStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const baseTextStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_BLACK,
}

const smallBaseTextStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_SECONDARY_TEXT,
}

export const styles = {
  WeekPickerRow: (isSmall: boolean, selected: boolean, header?: boolean) => {
    let style = isSmall ? smallRowStyle : regularRowStyle;
    if(header) return {...headerWeekPickerRowStyle, ...style};
    return selected ? {...selectedWeekPickerRowStyle, ...style} : {...weekPickerRowStyle, ...style};
  },
  TextContainer: textContainerStyle,
  Text: (isSmall: boolean, selected: boolean, isNotCurrentMonth: boolean, header?: boolean, disabled?: boolean) => {
    let style = isSmall ? smallBaseTextStyle : baseTextStyle;
    if(selected) style = {...style, color: WHITE};
    else if(isNotCurrentMonth || disabled) style = {...style, color: FOOTER_TEXT};
    if(header) style = {...style, color: DEFAULT_SECONDARY_TEXT};
    return style;
  }
}