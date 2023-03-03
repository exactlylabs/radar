import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageHeaderStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '600px',
  position: 'relative'
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
  alignItems: 'flex-start',
}

const smallTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
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
  width: '45%',
  height: 'auto',
  marginLeft: '11%'
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

const smallComingSoonContainerStyle: CSSProperties = {
  ...comingSoonContainerStyle,
  justifyContent: 'center',
  alignItems: 'center'
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

const mobilePageHeaderContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const smallMobilePageHeaderContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  margin: '0 auto',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const heroGradientBgStyle: CSSProperties = {
  width: '100vw',
  height: '100%',
  position: 'absolute',
  top: '-156px',
  left: 0,
  background: 'linear-gradient(rgb(234, 236, 255, 10%), rgb(145 151 204 / 34%), rgb(234, 236, 255, 0%))',
  zIndex: 0
}

export const styles = {
  MobilePageHeader: (isSmall: boolean) => isSmall ? smallMobilePageHeaderStyle : mobilePageHeaderStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  HeroImage: (isSmall: boolean) => isSmall ? smallHeroImageStyle : heroImageStyle,
  ComingSoonContainer: (isSmall: boolean) => isSmall ? smallComingSoonContainerStyle : comingSoonContainerStyle,
  StoresIcon: storesIconStyle,
  ComingSoonText: comingSoonTextStyle,
  MobilePageHeaderContent: (isSmall: boolean) => isSmall ? smallMobilePageHeaderContentStyle : mobilePageHeaderContentStyle,
  HeroGradientBg: heroGradientBgStyle,
}