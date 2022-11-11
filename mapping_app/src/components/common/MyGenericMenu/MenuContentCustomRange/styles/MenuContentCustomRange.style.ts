import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, FOOTER_TEXT, GENERIC_MENU} from "../../../../../styles/colors";

const menuContentCustomRangeStyle: CSSProperties = {
  width: '100%',
  marginTop: '35px',
}

const goBackIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  position: 'absolute',
  top: '18px',
  left: '20px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

const subtitleStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  marginBottom: '8px',
}

const yearSelectorContainerStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: GENERIC_MENU,
  padding: '15px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
}

const pickersContainerStyle: CSSProperties = {
  width: '100%',
  height: '104px',
  borderRadius: '6px',
  backgroundColor: GENERIC_MENU,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '30px',
}

const chevronStyle: CSSProperties = {
  width: '20px',
  height: '20px',
}

const dateRangeSelectorStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: GENERIC_MENU,
  padding: '15px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const selectedRangeTitleStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT,
}

const selectedRangeSubtitleStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
}

export const styles = {
  MenuContentCustomRange: menuContentCustomRangeStyle,
  GoBackIcon: goBackIconStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  YearSelectorContainer: yearSelectorContainerStyle,
  PickersContainer: pickersContainerStyle,
  Chevron: chevronStyle,
  DateRangeSelector: dateRangeSelectorStyle,
  SelectedRangeTitle: selectedRangeTitleStyle,
  SelectedRangeSubtitle: selectedRangeSubtitleStyle,
}