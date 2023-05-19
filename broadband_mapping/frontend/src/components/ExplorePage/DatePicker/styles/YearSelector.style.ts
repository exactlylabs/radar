import {CSSProperties} from "react";
import {DATE_PICKER, DEFAULT_TEXT} from "../../../../styles/colors";

const yearSelectorStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  backgroundColor: DATE_PICKER,
  backdropFilter: 'blur(10px)',
  borderRadius: '6px',
  paddingLeft: '15px',
  paddingRight: '15px',
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const yearSelectorContentStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const yearStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT,
}

const chevronStyle: CSSProperties = {
  width: '20px',
  height: '20px'
}

export const styles = {
  YearSelector: yearSelectorStyle,
  Year: yearStyle,
  Chevron: chevronStyle,
  YearSelectorContent: yearSelectorContentStyle,
}