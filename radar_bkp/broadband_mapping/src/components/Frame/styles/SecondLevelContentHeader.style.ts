import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, HEADER_AND_FOOTER_BOX_SHADOW_RGBA} from "../../../styles/colors";

const secondLevelContentHeaderStyle: CSSProperties = {
  width: '100%',
  height: '106px',
  boxShadow: `0 6px 10px 0 ${HEADER_AND_FOOTER_BOX_SHADOW_RGBA}`,
  paddingTop: '25px',
  zIndex: 1005,
  position: 'relative',
}

const titleStyle: CSSProperties = {
  fontSize: '24px',
  color: DEFAULT_TEXT,
  marginLeft: '60px',
  marginBottom: '6px',
}

const subtitleStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_SECONDARY_TEXT,
  marginLeft: '60px',
}

export const styles = {
  SecondLevelContentHeader: secondLevelContentHeaderStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle
}