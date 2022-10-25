import {CSSProperties} from "react";
import {BLACK, DEFAULT_TEXT, SEARCHBAR_TEXT, SELECTED_TAB} from "../../../../styles/colors";

const suggestionContainerStyle: CSSProperties = {
  width: '95%',
  margin: '5px auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '40px',
  cursor: 'pointer',
}

const iconStyle: CSSProperties = {
  width: '20px',
  color: BLACK,
  marginRight: '10px',
  marginLeft: '5px',
}

const textStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT,
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const secondaryTextStyle: CSSProperties = {
  fontSize: '15px',
  color: SEARCHBAR_TEXT,
}

const arrowStyle: CSSProperties = {
  marginRight: '5px',
  marginLeft: 'auto',
}

const textContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  color: SEARCHBAR_TEXT,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '75%'
}

export const styles = {
  SuggestionContainer: suggestionContainerStyle,
  Icon: iconStyle,
  Text: textStyle,
  SecondaryText: secondaryTextStyle,
  Arrow: arrowStyle,
  TextContainer: textContainerStyle,
}