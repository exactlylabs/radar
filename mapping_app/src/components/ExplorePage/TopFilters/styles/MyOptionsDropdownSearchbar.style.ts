import {CSSProperties} from "react";
import {BLACK, VERTICAL_DIVIDER} from "../../../../styles/colors";

const inputStyle: CSSProperties = {
  width: '90%',
  height: '50px',
  fontSize: '15px',
  margin: '10px 15px',
  border: 'none',
  borderBottom: `solid 1px ${VERTICAL_DIVIDER}`,
  color: BLACK
}

export const styles = {
  Input: () => {
    return inputStyle;
  }
}