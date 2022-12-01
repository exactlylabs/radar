import {CSSProperties} from "react";
import {
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  DEFAULT_SECONDARY_BLACK,
  GEOGRAPHICAL_CATEGORY_BOTTOM
} from "../../../../../styles/colors";

const smallSpeedFiltersContainerStyle: CSSProperties = {
  width: '1px',
  height: '1px',
  position: 'absolute',
  top: 0,
  right: 0
}

const layersIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
}

const buttonStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '6px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  position: 'absolute',
  bottom: '20px',
  right: 0,
  cursor: 'pointer'
}

const smallTabletButtonStyle: CSSProperties = {
  ...buttonStyle,
  bottom: '-38px',
  right: undefined,
  left: 'calc(100vw - 420px - 30px - 47px)'
}

const largeTabletButtonStyle: CSSProperties = {
  ...buttonStyle,
  right: undefined,
  left: 'calc(100vw - 420px - 40px - 47px)'
}

const rightPanelOpenLargeTabletButtonStyle: CSSProperties = {
  ...buttonStyle,
  right: undefined,
  left: 'calc(100vw - 420px - 40px - 47px - 497px)'
}

const selectedButtonStyle: CSSProperties = {
  backgroundColor: DEFAULT_SECONDARY_BLACK
}

export const styles = {
  SmallSpeedFiltersContainer: smallSpeedFiltersContainerStyle,
  LayersIcon: layersIconStyle,
  Button: (isOpen: boolean, isSmallTablet: boolean, isLargeTablet: boolean, isRightPanelOpen: boolean, isRightPanelHidden: boolean) => {
    let style;
    if(isSmallTablet) style = smallTabletButtonStyle;
    else if(isLargeTablet) {
      style = isRightPanelOpen && !isRightPanelHidden ? rightPanelOpenLargeTabletButtonStyle : largeTabletButtonStyle;
    }
    else style = buttonStyle;
    return isOpen ? {...style, ...selectedButtonStyle} : style;
  },
}