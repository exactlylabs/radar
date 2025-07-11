import {CSSProperties} from "react";
import {BLACK, DEFAULT_SECONDARY_TEXT} from "../../../../styles/colors";

const speedFilterStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  color: BLACK,
  marginRight: '5px',
}

const secondaryTextStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  marginRight: '10px',
}

export const styles = {
  SpeedFilterContainer: speedFilterStyle,
  Text: textStyle,
  SecondaryText: secondaryTextStyle,
}