import {CSSProperties} from "react";
import {DEFAULT_TEXT, WHITE} from "../../../../../styles/colors";

const menuContentSpeedTypeStyle: CSSProperties = {
  width: '100%',
  height: '240px',
}

const menuContentSpeedTypeContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '335px',
  height: '105px',
  backgroundColor: WHITE,
  borderRadius: '6px',
  marginBottom: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center'
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

export const styles = {
  MenuContentSpeedType: menuContentSpeedTypeStyle,
  MenuContentSpeedTypeContainer: menuContentSpeedTypeContainerStyle,
  Title: titleStyle
}