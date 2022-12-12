import {CSSProperties} from "react";
import {
  INVESTMENT_SECTION_BLUE, REDIRECTION_LINK,
  REDIRECTION_SECTION_BLUE_BOX_SHADOW, REDIRECTION_TITLE, WHITE
} from "../../../../utils/colors";

const toolkitRedirectionSectionStyle: CSSProperties = {
  minWidth: '750px',
  maxWidth: '1200px',
  minHeight: '330px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  boxShadow: `0 14px 40px -4px ${REDIRECTION_SECTION_BLUE_BOX_SHADOW}`,
  borderRadius: '20px',
  margin: '-80px auto 50px auto',
  zIndex: 10,
  position: 'relative'
}

const smallToolkitRedirectionSectionStyle: CSSProperties = {
  ...toolkitRedirectionSectionStyle,
  width: '100vw',
  height: '700px',
  minWidth: undefined,
  maxWidth: undefined,
  borderRadius: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const toolkitRedirectionSectionContentStyle: CSSProperties = {
  width: '85%',
  height: '320px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const smallToolkitRedirectionSectionContentStyle: CSSProperties = {
  ...toolkitRedirectionSectionContentStyle,
  width: 'calc(100% - 50px)',
  height: undefined,
  flexDirection: 'column',
  marginLeft: undefined,
  marginRight: undefined,
  margin: 'auto',
}

const toolkitRedirectionColumnStyle: CSSProperties = {
  width: '280px',
  height: '220px',
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
  textAlign: 'center'
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
  maxWidth: '400px',
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
  margin: 0
}

const linkChevronStyle: CSSProperties = {
  height: '14px',
  width: '14px',
  marginLeft: '5px'
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
}