import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, FOOTER_TEXT, VERTICAL_DIVIDER} from "../../../../styles/colors";

const myOptionsDropdownSearchbarContainerStyle: CSSProperties = {
  width: '100%',
  marginTop: '10px',
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
}

const titleStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '15px',
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  height: '50px',
  fontSize: '15px',
  marginLeft: '15px',
  border: 'none',
  borderBottom: `solid 1px ${VERTICAL_DIVIDER}`,
  color: FOOTER_TEXT
}

export const styles = {
  MyOptionsDropdownSearchbarContainer: myOptionsDropdownSearchbarContainerStyle,
  Title: titleStyle,
  Input: inputStyle,
}