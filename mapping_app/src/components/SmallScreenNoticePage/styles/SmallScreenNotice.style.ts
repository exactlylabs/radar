import {CSSProperties} from "react";
import {
  DEFAULT_CONTEXT_DIVIDER,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT,
  FOOTER_TEXT,
  RESPONSIVE_FOOTER
} from "../../../styles/colors";

const smallScreenNoticeStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
}

const logoStyle: CSSProperties = {
  width: '180px',
  height: '60px',
  margin: '20px auto',
}

const horizontalDividerStyle: CSSProperties = {
  width: '90%',
  height: '1px',
  borderRadius: '1.5px',
  backgroundColor: DEFAULT_CONTEXT_DIVIDER,
  margin: '0 auto 50px',
}

const gifStyle: CSSProperties = {
  width: '100px',
  height: '36px',
  margin: '0 auto 20px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  maxWidth: '315px',
  margin: '0 auto 15px',
  textAlign: 'center',
}

const textStyle: CSSProperties = {
  fontSize: '17px',
  color: DEFAULT_SECONDARY_TEXT,
  maxWidth: '315px',
  lineHeight: '22px',
  textAlign: 'center',
  margin: '0 auto 40px',
}

const ignoreContainerStyle: CSSProperties = {
  width: '175px',
  height: '18px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  cursor: 'pointer',
}

const ignoreTextStyle: CSSProperties = {
  fontSize: '17px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
}

const arrowStyle: CSSProperties = {
  width: '18px',
  height: '18px',
}

const footerStyle: CSSProperties = {
  width: '100%',
  height: '230px',
  backgroundColor: RESPONSIVE_FOOTER,
  borderRadius: '1.5px',
  position: 'absolute',
  bottom: 0
}

const footerTextAndLogoContainerStyle: CSSProperties = {
  width: '280px',
  height: '75px',
  margin: '20px auto',
  textAlign: 'center'
}

const footerLogoContainerStyle: CSSProperties = {
  width: '100%',
  height: '28px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '25px auto 0'
}

const anthcLogoStyle: CSSProperties = {
  width: '102px',
  height: '28px',
}

const exactlyLogoStyle: CSSProperties = {
  height: '28px',
}

const xlabLogoStyle: CSSProperties = {
  height: '28px',
}

const rightsTextContainerStyle: CSSProperties = {
  maxWidth: '200px',
  textAlign: 'center',
  margin: '-25px auto'
}

const lightTextStyle: CSSProperties = {
  fontSize: '15px',
  color: FOOTER_TEXT,
}

export const styles = {
  SmallScreenNotice: smallScreenNoticeStyle,
  Logo: logoStyle,
  HorizontalDivider: horizontalDividerStyle,
  Gif: gifStyle,
  Title: titleStyle,
  Text: textStyle,
  IgnoreContainer: ignoreContainerStyle,
  IgnoreText: ignoreTextStyle,
  Arrow: arrowStyle,
  FooterTextAndLogoContainer: footerTextAndLogoContainerStyle,
  FooterLogoContainer: footerLogoContainerStyle,
  Footer: footerStyle,
  AnthcLogo: anthcLogoStyle,
  ExactlyLogo: exactlyLogoStyle,
  XlabLogo: xlabLogoStyle,
  RightsTextContainer: rightsTextContainerStyle,
  LightText: lightTextStyle,
}