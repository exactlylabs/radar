import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, WHITE} from "../../../../styles/colors";

const optionsDropdownContainerStyle: CSSProperties = {
  width: 'max-content',
  maxWidth: '250px',
  borderRadius: '6px',
  backgroundColor: WHITE,
  position: 'absolute',
  top: '45px',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  maxHeight: '400px',
  overflowY: 'auto',
  overflowX: 'unset'
}

export const styles = {
  OptionsDropdownContainer: (dropLeft: boolean, dropRight: boolean) => {
    let style = optionsDropdownContainerStyle;
    if(dropLeft) style = {...style, right: '-10px'};
    if(dropRight) style = {...style, left: '-10px'}
    return style;
  }
}