import {CSSProperties} from "react";
import {BLACK} from "../../../../styles/colors";

const iconStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  color: BLACK,
  marginRight: '5px',
}

export const styles = {
  Icon: () => {
    return iconStyle;
  }
}