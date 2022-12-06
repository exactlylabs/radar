import {CSSProperties} from "react";
import {DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../utils/colors";

const customButtonStyle: CSSProperties = {
  width: 'max-content',
  height: 'max-content',
  padding: '9px 18px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '19px',
  backgroundColor: GET_STARTED_BUTTON_BG,
  cursor: 'pointer',
  color: DEFAULT_TEXT,
}

const textStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
}

export const styles = {
  CustomButton: customButtonStyle,
  Text: (backgroundColor?: string, color?: string) => {
    let style = textStyle;
    if(!!backgroundColor) style = {...style, backgroundColor};
    if(!!color) style = {...style, color};
    return style;
  },
}