import {CSSProperties} from "react";
import {DEFAULT_TEXT, WHITE} from "../../../../../styles/colors";

const modalContentCalendarStyle: CSSProperties = {
  width: '350px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

const menuContentCalendarContainerStyle: CSSProperties = {
  width: '100%',
  minHeight: '260px',
  maxHeight: '350px',
  backgroundColor: WHITE,
  borderRadius: '6px',
  marginBottom: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center'
}

export const styles = {
  ModalContentCalendar: modalContentCalendarStyle,
  Title: titleStyle,
  MenuContentCalendarContainer: menuContentCalendarContainerStyle,
}