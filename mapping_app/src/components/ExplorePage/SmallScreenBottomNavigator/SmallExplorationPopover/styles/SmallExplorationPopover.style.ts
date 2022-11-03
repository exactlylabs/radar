import {CSSProperties} from "react";
import {
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  DEFAULT_SECONDARY_BLACK,
  GEOGRAPHICAL_CATEGORY_BOTTOM
} from "../../../../../styles/colors";

const smallExplorationPopoverContainerStyle: CSSProperties = {
  width: '1px',
  height: '1px',
  position: 'absolute',
  top: 0,
  right: 0
}

const explorationIconStyle: CSSProperties = {
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

const selectedButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: DEFAULT_SECONDARY_BLACK
}

export const styles = {
  SmallExplorationPopoverContainer: smallExplorationPopoverContainerStyle,
  ExplorationIcon: explorationIconStyle,
  Button: (isOpen: boolean) => {
    return isOpen ? selectedButtonStyle : buttonStyle;
  },
}