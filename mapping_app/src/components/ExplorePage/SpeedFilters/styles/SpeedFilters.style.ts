import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, SPEED_FILTERS} from "../../../../styles/colors";

const speedFiltersStyle: CSSProperties = {
  height: '40px',
  width: '555px',
  backgroundColor: SPEED_FILTERS,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  position: 'absolute',
  bottom: '25px',
  right: '60px',
  borderRadius: '6px',
  zIndex: 1002,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}

const slidedSpeedFiltersStyle: CSSProperties = {
  ...speedFiltersStyle,
  right: '521px',
}

export const styles = {
  SpeedFiltersContainer: (isRightPanelOpen: boolean) => {
    return isRightPanelOpen ? slidedSpeedFiltersStyle : speedFiltersStyle;
  }
}