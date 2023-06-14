import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, HEADER_AND_FOOTER_BOX_SHADOW_RGBA} from "../../../styles/colors";

const topLevelFooterStyle: CSSProperties = {
  height: '100px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: `0 -2px 4px 0 ${HEADER_AND_FOOTER_BOX_SHADOW_RGBA}`,
  position: 'relative',
  zIndex: 1002,
}

const leftSideContainerStyle: CSSProperties = {
  height: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginLeft: '60px',
}

const rightSideContainerStyle: CSSProperties = {
  height: '100%',
  marginRight: '60px',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
}

const mappingLogoStyle: CSSProperties = {
  height: '28px',
}

const linkStyle: CSSProperties = {
  fontSize: '17px',
  color: DEFAULT_SECONDARY_TEXT,
  marginLeft: '40px',
  textDecoration: 'none',
}

export const styles = {
  TopLevelFooter: topLevelFooterStyle,
  MappingLogo: mappingLogoStyle,
  LeftSideContainer: leftSideContainerStyle,
  RightSideContainer: rightSideContainerStyle,
  Link:  linkStyle,
}