import {CSSProperties} from "react";
import {CLOSE_PANEL_BUTTON_SHADOW_RGBA, DATE_PICKER, DEFAULT_SECONDARY_TEXT} from "../../../../styles/colors";

const weekPickerStyle: CSSProperties = {
  width: '265px',
  height: '280px',
  borderRadius: '8px',
  backgroundColor: DATE_PICKER,
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  zIndex: 1011,
  position: 'absolute',
  left: '308px',
  top: '-45%',
  padding: '15px',
}

const smallWeekPickerStyle: CSSProperties = {
  ...weekPickerStyle,
  width: '100%',
  maxWidth: '335px',
  height: '320px',
  position: 'relative',
  left: undefined,
  top: undefined,
  marginLeft: 'auto',
  marginRight: 'auto',
}

const monthSelectorStyle: CSSProperties = {
  width: '100%',
  height: '38px',
  borderRadius: '6px',
  backgroundColor: DATE_PICKER,
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: '10px',
  paddingRight: '10px',
}

const chevronStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  cursor: 'pointer',
}

const disabledChevronStyle: CSSProperties = {
  ...chevronStyle,
  cursor: 'not-allowed',
  opacity: 0.5
}

const monthTitleStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT
}

export const styles = {
  WeekPicker: (isSmall: boolean) => {
    return isSmall ? smallWeekPickerStyle : weekPickerStyle;
  },
  MonthSelector: monthSelectorStyle,
  Chevron: (disabled: boolean) => {
    return disabled ? disabledChevronStyle : chevronStyle;
  },
  MonthTitle: monthTitleStyle,
}