import {CSSProperties} from "react";
import {BLACK, DEFAULT_BUTTON_BOX_SHADOW_RGBA, WHITE} from "../../../styles/colors";

const myButtonStyle: CSSProperties = {
  paddingLeft: '15px',
  paddingRight: '15px',
  paddingTop: '14px',
  paddingBottom: '14px',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: BLACK, // default
  color: WHITE, // default
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  cursor: 'pointer',
}

export const styles = {
  MyButton: (backgroundColor?: string, color?: string, backdropFilter?: string) => {
    let style = myButtonStyle;
    if(color) style = {...style, color};
    if(backgroundColor) style = {...style, backgroundColor};
    if(backdropFilter) style = {...style, backdropFilter};
    return style;
  }
}