import {CSSProperties} from "react";
import {FOOTER_TEXT} from "../../../../styles/colors";

const speedDistributionStyle: CSSProperties = {
  width: '100%',
  margin: '20px auto 0',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

const titleStyle: CSSProperties = {
  fontSize: '13px',
  color: FOOTER_TEXT,
}

export const styles = {
  SpeedDistributionContainer: speedDistributionStyle,
  Title: titleStyle
}