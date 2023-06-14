import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, NO_GEOLOCATION_ALERT, WHITE} from "../../../../styles/colors";

const noGeolocationAlertStyle: CSSProperties = {
  width: '452px',
  height: '60px',
  position: 'absolute',
  left: '50%',
  marginLeft: '-226px',
  backgroundColor: NO_GEOLOCATION_ALERT,
  borderRadius: '6px',
  boxShadow: `0 4px 8px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  color: WHITE,
  padding: '10px 20px',
  textAlign: 'center',
  zIndex: 2000
}

const smallNoGeolocationAlertStyle: CSSProperties = {
  ...noGeolocationAlertStyle,
  width: 'calc(100vw - 30px)',
  height: undefined,
  padding: '10px 15px',
  top: undefined,
  left: '15px',
  marginLeft: undefined,
}

const textStyle: CSSProperties = {
  fontSize: '16px',
  color: WHITE,
  width: '100%',
}

export const styles = {
  NoGeolocationAlert: (isSmall: boolean) => isSmall ? smallNoGeolocationAlertStyle : noGeolocationAlertStyle,
  Text: textStyle,
}