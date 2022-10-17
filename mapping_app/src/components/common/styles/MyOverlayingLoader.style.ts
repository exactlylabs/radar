import {CSSProperties} from "react";
import {WHITE} from "../../../styles/colors";

const overlayingLoaderContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
  backgroundColor: WHITE,
  opacity: 0.5,
  position: 'absolute'
}

export const styles = {
  OverlayingLoaderContainer: overlayingLoaderContainerStyle
}