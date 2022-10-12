import {CSSProperties} from "react";
import {WHITE} from "../../../../styles/colors";

const suggestionsBoxContainerStyle: CSSProperties = {
  width: '100%',
  backgroundColor: WHITE,
  borderRadius: '6px',
  maxHeight: '180px',
  overflowY: 'auto',
  zIndex: 1050,
  position: 'absolute',
  top: '65px',
  left: 0,
}


export const styles = {
  SuggestionsBoxContainer: suggestionsBoxContainerStyle
}