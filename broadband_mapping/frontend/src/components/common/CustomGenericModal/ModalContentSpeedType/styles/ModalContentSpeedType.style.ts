import {CSSProperties} from "react";
import {DEFAULT_TEXT, WHITE} from "../../../../../styles/colors";

const modalContentSpeedTypeStyle: CSSProperties = {
  width: '300px',
  height: '240px',
}

const modalContentSpeedTypeContainerStyle: CSSProperties = {
  width: '100%',
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
  ModalContentSpeedType: modalContentSpeedTypeStyle,
  ModalContentSpeedTypeContainer: modalContentSpeedTypeContainerStyle,
  Title: titleStyle
}