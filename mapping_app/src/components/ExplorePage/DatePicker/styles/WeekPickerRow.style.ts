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

export const styles = {
  WeekPickerRow: (selected: boolean, header?: boolean) => {
    if(header) return headerWeekPickerRowStyle;
    return selected ? selectedWeekPickerRowStyle : weekPickerRowStyle;
  },
  TextContainer: textContainerStyle,
  Text: (selected: boolean, isNotCurrentMonth: boolean, header?: boolean, disabled?: boolean) => {
    let style = baseTextStyle;
    if(selected) style = {...style, color: WHITE};
    else if(isNotCurrentMonth || disabled) style = {...style, color: FOOTER_TEXT};
    if(header) style = {...style, color: DEFAULT_SECONDARY_TEXT};
    return style;
  }
}