import {CSSProperties} from "react";
import {GENERIC_MENU, SHADOW_UNDERLAY} from "../../../../styles/colors";

const myGenericModalStyle: CSSProperties = {
  width: 'max-content',
  height: 'max-content',
  maxHeight: '625px',
  maxWidth: '450px',
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: GENERIC_MENU,
  boxShadow: `0 -2px -4px 10px ${SHADOW_UNDERLAY}`,
  backdropFilter: 'blur(10px)',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1100,
  overflow: 'hidden hidden'
}

const underlayStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  position: 'absolute',
  top: '-48px',
  left: 0,
  backgroundColor: SHADOW_UNDERLAY,
  zIndex: 1099,
}

const closeIconStyle: CSSProperties = {
  width: '26px',
  height: '26px',
  position: 'absolute',
  right: '15px',
  top: '15px',
  cursor: 'pointer',
  zIndex: 1100
}

export const styles = {
  MyGenericModal: myGenericModalStyle,
  Underlay: underlayStyle,
  CloseIcon: closeIconStyle,
}