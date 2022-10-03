import {CSSProperties} from "react";
import {BLACK, SELECTED_TAB} from "../../../../styles/colors";

const suggestionContainerStyle: CSSProperties = {
  width: '95%',
  margin: '5px auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '45px',
  cursor: 'pointer',
  borderBottom: `solid 1px ${SELECTED_TAB}`,
}

const iconStyle: CSSProperties = {
  width: '18px',
  color: BLACK,
  marginRight: '10px',
  marginLeft: '5px',
}

const textStyle: CSSProperties = {
  fontSize: '16px',
  maxWidth: '85%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const arrowStyle: CSSProperties = {
  marginRight: '5px',
  marginLeft: 'auto',
}

export const styles = {
  SuggestionContainer: () => {
    return suggestionContainerStyle;
  },
  Icon: () => {
    return iconStyle;
  },
  Text: () => {
    return textStyle;
  },
  Arrow: () => {
    return arrowStyle;
  }
}