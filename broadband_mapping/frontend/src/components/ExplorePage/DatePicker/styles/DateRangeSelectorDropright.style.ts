import {CSSProperties} from "react";
import {DATE_PICKER, DATE_PICKER_HORIZONTAL_DIVIDER, DEFAULT_TEXT, FOOTER_TEXT} from "../../../../styles/colors";

const dateRangeSelectorDroprightStyle: CSSProperties = {
  width: '100%',
  height: '56px',
  borderBottomLeftRadius: '6px',
  borderBottomRightRadius: '6px',
  backgroundColor: DATE_PICKER,
  borderTop: `solid 1px ${DATE_PICKER_HORIZONTAL_DIVIDER}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: '15px',
  paddingRight: '15px',
}

const titleStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT,
}

const chevronStyle: CSSProperties = {
  width: '20px',
  height: '20px'
}

const yearSelectorContentStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const subtitleStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
}

const textContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center'
}

export const styles = {
  DateRangeSelectorDropright: dateRangeSelectorDroprightStyle,
  Title: titleStyle,
  Chevron: chevronStyle,
  YearSelectorContent: yearSelectorContentStyle,
  Subtitle: subtitleStyle,
  TextContainer: textContainerStyle,
}