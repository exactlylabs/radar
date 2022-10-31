import {CSSProperties} from "react";
import {BLACK, WHITE} from "../../../styles/colors";

const buttonContainerStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: BLACK,
  color: WHITE,
  paddingLeft: '15px',
  paddingRight: '15px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
}

const iconLessButtonContainerStyle: CSSProperties = {
  ...buttonContainerStyle,
  justifyContent: 'center',
}

const textStyle: CSSProperties = {
  fontSize: '16px',
}

export const styles = {
  ButtonContainer: (hasIcon: boolean, backgroundColor?: string, color?: string) => {
    let style = hasIcon ? buttonContainerStyle : iconLessButtonContainerStyle;
    let boxShadow = `0 4px 8px -4px `;
    if(backgroundColor) {
      boxShadow += backgroundColor;
      style = {...style, backgroundColor};
    } else {
      boxShadow += BLACK;
    }
    if(color) style = {...style, color};
    return {...style, boxShadow};
  },
  Text: textStyle
}