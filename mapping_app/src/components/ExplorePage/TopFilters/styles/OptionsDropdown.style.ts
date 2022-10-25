import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, DEFAULT_SECONDARY_TEXT, WHITE} from "../../../../styles/colors";

const optionsDropdownContainerStyle: CSSProperties = {
  width: 'max-content',
  maxWidth: '250px',
  borderRadius: '6px',
  backgroundColor: WHITE,
  position: 'absolute',
  top: '50px',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  maxHeight: '400px',
  overflowY: 'auto',
  overflowX: 'unset'
}

const noResultsTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  margin: '20px 15px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start'
}

const noResultsTextStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  marginRight: '3px',
}

export const styles = {
  OptionsDropdownContainer: (dropLeft: boolean, dropRight: boolean) => {
    let style = optionsDropdownContainerStyle;
    if(dropLeft) style = {...style, right: '-5px'};
    if(dropRight) style = {...style, left: '-5px'}
    return style;
  },
  NoResultsTextContainer: noResultsTextContainerStyle,
  NoResultsText: noResultsTextStyle,
}