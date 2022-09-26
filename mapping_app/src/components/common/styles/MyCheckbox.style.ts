import {CSSProperties} from "react";
import {WHITE} from "../../../styles/colors";

const myCheckboxContainerStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  color: WHITE,
  borderRadius: '4px',
  marginRight: '8px',
  marginLeft: '10px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const iconStyle: CSSProperties = {
  color: WHITE,
  height: '15px'
}

export const styles = {
  MyCheckboxContainer: (backgroundColor: string, color: string) => {
    const boxShadow = `0 2px 8px -2px ${backgroundColor}`;
    const border = `solid 1px ${backgroundColor}`;
    return {
      ...myCheckboxContainerStyle,
      boxShadow,
      border,
      backgroundColor,
      color
    };
  },
  Icon: () => {
    return iconStyle;
  }
}