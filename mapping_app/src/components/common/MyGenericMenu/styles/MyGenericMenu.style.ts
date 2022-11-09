import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, GENERIC_MENU, GEOGRAPHICAL_CATEGORY_BOTTOM} from "../../../../styles/colors";

const myGenericMenuStyle: CSSProperties = {
  width: '100vw',
  height: 'max-content',
  maxHeight: 'calc(100vh - 58px)',
  overflowY: 'hidden',
  overflowX: 'hidden',
  backgroundColor: GENERIC_MENU,
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
  zIndex: 1200,
}

export const styles = {
  MyGenericMenu: myGenericMenuStyle,
  CloseIcon: closeIconStyle,
}