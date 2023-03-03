import {CSSProperties} from "react";
import {CUSTOM_CHECKBOX_FILL, CUSTOM_CHECKBOX_FILL_CHECKED} from "../../../../utils/colors";

const checkboxStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '6px',
  backgroundColor: CUSTOM_CHECKBOX_FILL,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  marginRight: '8px'
}

const checkedCheckboxStyle: CSSProperties = {
  ...checkboxStyle,
  backgroundColor: CUSTOM_CHECKBOX_FILL_CHECKED
}

const checkboxIconStyle: CSSProperties = {
  width: '14px',
  height: '14px'
}

export const styles = {
  Checkbox: (isChecked: boolean) => isChecked ? checkedCheckboxStyle : checkboxStyle,
  CheckboxIcon: checkboxIconStyle,
}