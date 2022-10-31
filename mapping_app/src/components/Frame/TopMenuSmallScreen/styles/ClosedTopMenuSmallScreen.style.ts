import {CSSProperties} from "react";
import {HEADER_AND_FOOTER_BOX_SHADOW_RGBA, WHITE} from "../../../../styles/colors";

const closedTopMenuContainerStyle: CSSProperties = {
  width: '100vw',
  height: '48px',
  backgroundColor: WHITE,
  boxShadow: `0 2px 4px 0px ${HEADER_AND_FOOTER_BOX_SHADOW_RGBA}`,
  padding: '14px 20px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1050,
}

const openedTopMenuContainerStyle: CSSProperties = {
  ...closedTopMenuContainerStyle,
  boxShadow: 'none',
}

const hamburgerStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  position: 'absolute',
  left: '20px',
  cursor: 'pointer'
}

const mappingLogoStyle: CSSProperties = {
  width: '200px',
  height: '24px',
}

export const styles = {
  ClosedTopMenuContainer: (isTopMenuOpen: boolean) => {
    return isTopMenuOpen ? openedTopMenuContainerStyle : closedTopMenuContainerStyle;
  },
  Hamburger: hamburgerStyle,
  MappingLogo: mappingLogoStyle,
}