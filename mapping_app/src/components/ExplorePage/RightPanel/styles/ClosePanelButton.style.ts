import {CSSProperties} from "react";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../../styles/colors";

const closePanelButtonStyle: CSSProperties = {
  width: '25px',
  height: '88px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  borderBottomLeftRadius: '6px',
  borderTopLeftRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: '260px',
  left: 0
}

const arrowStyle: CSSProperties = {
  color: BLACK,
  width: '16px',
}

export const styles = {
  ClosePanelButtonContainer: closePanelButtonStyle,
  Arrow: arrowStyle,
}