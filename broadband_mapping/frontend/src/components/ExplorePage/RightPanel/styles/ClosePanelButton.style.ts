import {CSSProperties} from "react";
import {BLACK, CLOSE_PANEL_BUTTON_SHADOW_RGBA, DEFAULT_SECONDARY_BUTTON} from "../../../../styles/colors";

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
  left: 0,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
}

const hiddenClosePanelButtonStyle: CSSProperties = {
  ...closePanelButtonStyle,
  left: undefined,
  right: '10px',
}

const arrowStyle: CSSProperties = {
  color: BLACK,
  width: '16px',
}

export const styles = {
  ClosePanelButtonContainer: (isHidden: boolean) => {
    return isHidden ? hiddenClosePanelButtonStyle : closePanelButtonStyle;
  },
  Arrow: arrowStyle,
}