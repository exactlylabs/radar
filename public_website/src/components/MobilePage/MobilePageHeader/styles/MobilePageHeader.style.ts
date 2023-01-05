import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageHeaderStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const smallMobilePageHeaderStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '50px',
  marginBottom: '60px'
}

const textContainerStyle: CSSProperties = {
  width: '40%',
  maxWidth: '478px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const smallTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '325px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '30px',
  textAlign: 'center'
}

const titleStyle: CSSProperties = {
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const smallTitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.6px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 40px 0'
}

const smallSubtitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
}

const heroImageStyle: CSSProperties = {
  width: '582px',
  height: 'auto'
}

const smallHeroImageStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  marginTop: '-50px'
}

const comingSoonContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '5px',
  marginTop: '-5px',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const storesIconStyle: CSSProperties = {
  width: '54px',
  height: 'auto',
  marginBottom: '5px'
}

const comingSoonTextStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#6d6a94',
  margin: 0
}

export const styles = {
  MobilePageHeader: (isSmall: boolean) => isSmall ? smallMobilePageHeaderStyle : mobilePageHeaderStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  HeroImage: (isSmall: boolean) => isSmall ? smallHeroImageStyle : heroImageStyle,
  ComingSoonContainer: comingSoonContainerStyle,
  StoresIcon: storesIconStyle,
  ComingSoonText: comingSoonTextStyle,
}