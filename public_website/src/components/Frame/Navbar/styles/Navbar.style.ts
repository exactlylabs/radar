import {CSSProperties} from "react";
import {TRANSPARENT} from "../../../../utils/colors";

const navbarStyle: CSSProperties = {
  width: '100vw',
  height: 'max-content',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  backgroundColor: TRANSPARENT,
  position: 'relative',
}

const colorBackgroundStyle: CSSProperties = {
  width: '100%',
  height: '1012px',
  position: 'absolute',
  top: 0,
  left: 0,
  verticalAlign: 'top'
}

export const styles = {
  Navbar: navbarStyle,
  ColorBackground: colorBackgroundStyle
}