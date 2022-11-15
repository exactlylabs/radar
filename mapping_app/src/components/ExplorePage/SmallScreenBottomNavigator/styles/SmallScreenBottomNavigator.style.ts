import {CSSProperties} from "react";

const smallScreenBottomNavigatorContainerStyle: CSSProperties = {
  width: 'calc(100vw - 30px)',
  minWidth: '250px',
  maxWidth: '420px',
  height: '40px',
  position: 'absolute',
  left: '15px',
  bottom: '30px',
  zIndex: 1005,
}

export const styles = {
  SmallScreenBottomNavigatorContainer: smallScreenBottomNavigatorContainerStyle,
}