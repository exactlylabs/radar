import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, GEOGRAPHICAL_CATEGORY_BOTTOM} from "../../../../styles/colors";

const myGenericMenuPropsStyle: CSSProperties = {
  width: '100vw',
  height: 'max-content',
  minHeight: '250px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM,
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  position: 'absolute',
  bottom: 0,
  left: 0,
  padding: '20px',
  zIndex: 1100,
}

const closeIconStyle: CSSProperties = {
  width: '26px',
  height: '26px',
  position: 'absolute',
  top: '15px',
  right: '15px',
  cursor: 'pointer',
}

export const styles = {
  MyGenericMenuProps: myGenericMenuPropsStyle,
  CloseIcon: closeIconStyle,
}