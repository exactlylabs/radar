import {CSSProperties} from "react";
import {
  CLOSE_PANEL_BUTTON_SHADOW_RGBA,
  DATE_PICKER,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT
} from "../../../../styles/colors";

const datePickerContainerStyle: CSSProperties = {
  width: '350px',
  height: '385px',
  borderRadius: '8px',
  backgroundColor: DATE_PICKER,
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  zIndex: 1010,
  position: 'absolute',
  left: '50%',
  marginLeft: '-175px',
  top: '50%',
  marginTop: '-190px',
  paddingLeft: '25px',
  paddingRight: '25px',
  paddingTop: '25px',
  paddingBottom: '25px',
}

const titleContainerStyle: CSSProperties = {
  width: '100%',
  height: '25px',
  position: 'relative',
  display: 'flex',
  alignItems: 'baseline',
  marginBottom: '20px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
}

const closeIconStyle: CSSProperties = {
  width: '22px',
  height: '22px',
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  cursor: 'pointer',
}

const yearSelectorContainer: CSSProperties = {
  width: '100%',
  height: '74px',
  marginBottom: '15px',
}

const dateRangeSelectorContainerStyle: CSSProperties = {

}

const labelStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  marginBottom: '8px',
}

export const styles = {
  DatePickerContainer: datePickerContainerStyle,
  TitleContainer: titleContainerStyle,
  Title: titleStyle,
  CloseIcon: closeIconStyle,
  YearSelectorContainer: yearSelectorContainer,
  DateRangeSelectorContainer: dateRangeSelectorContainerStyle,
  Label: labelStyle,
}