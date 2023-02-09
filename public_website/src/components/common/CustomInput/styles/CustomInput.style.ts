import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const inputStyle: CSSProperties = {
  width: 'calc(100% - 36px)',
  borderRadius: '8px',
  fontSize: '16px',
  lineHeight: '25px',
  color: DEFAULT_TEXT
}

const smallInputStyle: CSSProperties = {
  width: 'calc(100% - 36px)',
  borderRadius: '8px',
  fontSize: '16px',
  lineHeight: '25px',
  color: DEFAULT_TEXT
}

export const styles = {
  Input: (isSmall: boolean) => isSmall ? smallInputStyle : inputStyle,
}