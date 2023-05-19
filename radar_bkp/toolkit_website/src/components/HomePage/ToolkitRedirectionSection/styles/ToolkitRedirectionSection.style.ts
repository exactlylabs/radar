import {CSSProperties} from "react";
import {
  INVESTMENT_SECTION_BLUE, REDIRECTION_LINK,
  REDIRECTION_SECTION_BLUE_BOX_SHADOW, REDIRECTION_TITLE, WHITE
} from "../../../../utils/colors";

const toolkitRedirectionSectionStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  boxShadow: `0 14px 40px -4px ${REDIRECTION_SECTION_BLUE_BOX_SHADOW}`,
  borderRadius: '20px',
  margin: '-80px auto 0',
  zIndex: 10,
  position: 'relative',
  paddingTop: '40px',
  paddingBottom: '40px',
  overflow: 'hidden'
}

const smallToolkitRedirectionSectionStyle: CSSProperties = {
  ...toolkitRedirectionSectionStyle,
  width: '100vw',
  height: 'max-content',
  minWidth: undefined,
  maxWidth: undefined,
  borderRadius: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const toolkitRedirectionSectionContentStyle: CSSProperties = {
  width: '85%',
  height: 'max-content',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  zIndex: 1,
  position: 'relative'
}

const smallToolkitRedirectionSectionContentStyle: CSSProperties = {
  ...toolkitRedirectionSectionContentStyle,
  width: 'calc(100% - 50px)',
  height: undefined,
  minHeight: undefined,
  flexDirection: 'column',
  alignItems: 'center',
}

const toolkitRedirectionColumnStyle: CSSProperties = {
  width: '30%',
  maxWidth: '280px',
  minHeight: '220px',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

const smallToolkitRedirectionColumnStyle: CSSProperties = {
  ...toolkitRedirectionColumnStyle,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: undefined
}

const titleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: REDIRECTION_TITLE,
  margin: '0 0 10px 0'
}

const smallTitleStyle: CSSProperties = {
  ...titleStyle,
  width: '100%',
}

const subtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: WHITE,
  margin: '0 0 25px 0',
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  width: '100%',
  margin: '0 0 15px 0'
}

const linkContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: '12px'
}

const smallLinkContainerStyle: CSSProperties = {
  ...linkContainerStyle,
  justifyContent: 'center',
  marginBottom: '8px'
}

const linkStyle: CSSProperties = {
  fontSize: '16px',
  color: REDIRECTION_LINK,
  margin: 0,
  textDecoration: 'none',
  width: 'max-content',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
}

const linkChevronStyle: CSSProperties = {
  height: '14px',
  width: '14px',
  marginLeft: '5px'
}

const centerBlueBgStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 0,
  left: 0,
  bottom: 0,
  width: '70%',
  height: 'auto',
  filter: 'blur(50px)'
}
const topRightBgStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 0,
  right: 0,
  top: 0,
  width: '39%',
  height: 'auto'
}
const bottomBlueBgStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 0,
  left: 0,
  bottom: 0,
  width: '100%',
  height: 'auto'
}
const leftBlueBgStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 0,
  left: 0,
  bottom: 0,
  width: '60%',
  height: '100%'
}

const smallRedirectBg1Style: CSSProperties = {
  width: '100%',
  height: 'auto',
  zIndex: 0,
  position: 'absolute',
  left: '50%',
  marginLeft: '-50%',
  top: 0,
  filter: 'blur(50px)'
}

const smallRedirectBg2Style: CSSProperties = {
  width: '100%',
  height: 'auto',
  zIndex: 0,
  position: 'absolute',
  left: '50%',
  marginLeft: '-50%',
  top: 0,
  filter: 'blur(50px)'
}

const bigCircleStyle: CSSProperties = {
  width: '75%',
  height: 'auto',
  position: 'absolute',
  right: 0,
  top: 0
}

export const styles = {
  ToolkitRedirectionSection: (isSmall: boolean) => isSmall ? smallToolkitRedirectionSectionStyle : toolkitRedirectionSectionStyle,
  ToolkitRedirectionSectionContent: (isSmall: boolean) => isSmall ? smallToolkitRedirectionSectionContentStyle : toolkitRedirectionSectionContentStyle,
  ToolkitRedirectionColumn: (isSmall: boolean) => isSmall ? smallToolkitRedirectionColumnStyle : toolkitRedirectionColumnStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  LinkContainer: (isSmall: boolean) => isSmall ? smallLinkContainerStyle : linkContainerStyle,
  Link: linkStyle,
  LinkChevron: linkChevronStyle,
  CenterBlueBg: centerBlueBgStyle,
  TopRightBg: topRightBgStyle,
  BottomBlueBg: bottomBlueBgStyle,
  LeftBlueBg: leftBlueBgStyle,
  SmallRedirectBg1: smallRedirectBg1Style,
  SmallRedirectBg2: smallRedirectBg2Style,
  BigCircle: bigCircleStyle,
}