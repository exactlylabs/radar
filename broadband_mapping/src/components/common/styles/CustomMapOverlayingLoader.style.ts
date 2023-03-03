import {CSSProperties} from "react";
import {LOADER_PILL, MAP_OVERLAY, SEARCHBAR_BOX_SHADOW_RGBA, WHITE} from "../../../styles/colors";

const overlayingLoaderContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
  backgroundColor: MAP_OVERLAY,
  position: 'absolute'
}

const contentContainerStyle: CSSProperties = {
  width: '130px',
  height: '30px',
  backgroundColor: LOADER_PILL,
  boxShadow: `0 2px 10px -4px ${SEARCHBAR_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}

const textStyle: CSSProperties = {
  fontSize: '14px',
  color: WHITE,
}

const spinnerStyle: CSSProperties = {
  width: '15px',
  marginRight: '5px',
}

export const styles = {
  OverlayingLoaderContainer: overlayingLoaderContainerStyle,
  ContentContainer: contentContainerStyle,
  Text: textStyle,
  Spinner: spinnerStyle,
}