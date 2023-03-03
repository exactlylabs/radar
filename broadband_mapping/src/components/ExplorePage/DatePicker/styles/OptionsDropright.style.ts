import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, OPTIONS_DROPRIGHT} from "../../../../styles/colors";

const optionsDroprightContainerStyle: CSSProperties = {
  width: 'max-content',
  minHeight: '50px',
  maxHeight: '300px',
  borderRadius: '6px',
  backgroundColor: OPTIONS_DROPRIGHT,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  position: 'absolute',
  top: 0,
  left: '308px',
  zIndex: 1015,
  overflowY: 'auto',
  overflowX: 'unset',
}

const bottomOptionsDroprightContainerStyle: CSSProperties = {
  ...optionsDroprightContainerStyle,
  top: undefined,
  bottom: 0
}

export const styles = {
  OptionsDroprightContainer: (alignedToBottom?: boolean) => {
    return alignedToBottom ? bottomOptionsDroprightContainerStyle : optionsDroprightContainerStyle;
  },
}