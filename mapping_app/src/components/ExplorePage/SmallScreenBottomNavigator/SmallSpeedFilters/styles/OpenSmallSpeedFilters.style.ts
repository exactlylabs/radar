import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, GEOGRAPHICAL_CATEGORY_BOTTOM} from "../../../../../styles/colors";

const openSmallSpeedFiltersContainerStyle: CSSProperties = {
  width: '215px',
  height: '112px',
  position: 'absolute',
  bottom: '20px',
  right: 'calc(100vw - 48px - 215px + 15px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

const speedFiltersContainerStyle: CSSProperties = {
  width: 'max-content',
  height: '32px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  padding: '6px',
  paddingLeft: '0',
  borderRadius: '6px',
}

export const styles = {
  OpenSmallSpeedFiltersContainer: openSmallSpeedFiltersContainerStyle,
  SpeedFiltersContainer: speedFiltersContainerStyle,
}