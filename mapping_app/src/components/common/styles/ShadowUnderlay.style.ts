import {CSSProperties} from "react";
import {SHADOW_UNDERLAY} from "../../../styles/colors";

const shadowUnderlayStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  position: 'absolute',
  left: 'calc(-50vw + 172.5px)',
  top: 'calc(-50vh + 161px)',
  backgroundColor: SHADOW_UNDERLAY,
}

export const styles = {
  ShadowUnderlay: shadowUnderlayStyle,
}