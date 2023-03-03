import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, DEFAULT_SECONDARY_TEXT, WHITE} from "../../../../styles/colors";

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

const noResultsContainerStyle: CSSProperties = {
  height: '60px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingLeft: '20px',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)'
}

const noResultsTextStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  marginRight: '2px',
}

export const styles = {
  SuggestionsBoxContainer: suggestionsBoxContainerStyle,
  NoResultsContainer: noResultsContainerStyle,
  NoResultsText: noResultsTextStyle,
}