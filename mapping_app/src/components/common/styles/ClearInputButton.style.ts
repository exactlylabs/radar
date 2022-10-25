import {CSSProperties} from "react";
import {FOOTER_TEXT} from "../../../styles/colors";

const clearInputButtonContainerStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: FOOTER_TEXT,
  opacity: 0.8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer'
}

const iconStyle: CSSProperties = {
  width: '16px',
  height: '16px'
}

export const styles = {
  ClearInputButtonContainer: clearInputButtonContainerStyle,
  Icon: iconStyle,
}