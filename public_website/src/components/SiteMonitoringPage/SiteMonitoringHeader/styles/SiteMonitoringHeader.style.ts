import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";
import siteMonitoringHeader from "../SiteMonitoringHeader";

const siteMonitoringHeaderStyle: CSSProperties = {
  width: '100%',
  height: '340px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '100px',
  position: 'relative'
}

const smallSiteMonitoringHeaderStyle: CSSProperties = {
  ...siteMonitoringHeaderStyle,
  height: undefined,
  flexDirection: 'column',
  marginTop: 0
}

const textContainerStyle: CSSProperties = {
  width: '40%',
  maxWidth: '480px',
  minWidth: '250px',
  maxHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '50px',
}

const smallTextContainerStyle: CSSProperties = {
  ...textContainerStyle,
  width: '100%',
  maxWidth: '588px',
  maxHeight: undefined,
  textAlign: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '30px'
}

const titleStyle: CSSProperties = {
  width: '100%',
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const smallTitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '588px',
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.6px',
  margin: '0 0 15px 0'
}

const subtitleStyle: CSSProperties = {
  width: '100%',
  fontSize: '18px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const smallSubtitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const cardsStyle: CSSProperties = {
  width: '30%',
  minWidth: '350px',
  height: 'auto',
  position: 'absolute',
  right: '14%',
  top: '-5%',
  zIndex: 1,
}

const smallCardsStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxWidth: '450px',
  margin: '50px auto',
  zIndex: 1
}

const backgroundStyle: CSSProperties = {
  width: '915px',
  height: '490px',
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 0
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const blueShapeStyle: CSSProperties = {
  width: '1074px',
  height: '545px',
  position: 'absolute',
  right: '75px',
  top: '240px',
  zIndex: 0
}

const siteMonitoringHeaderContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '0 auto',
  zIndex: 1,
  position: 'relative'
}

const heroBlueBgStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '62%',
  height: 'auto',
  zIndex: 0,
  filter: 'blur(50px)',
  opacity: 0.8,
  maxWidth: '745px'
}

const heroOrangeBgStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '40%',
  height: 'auto',
  zIndex: 0,
  filter: 'blur(50px)',
  maxWidth: '480px'
}

const heroMapBgStyle: CSSProperties = {
  position: 'absolute',
  right: '40px',
  bottom: 0,
  width: '60%',
  height: 'auto',
  zIndex: 0,
  maxWidth: '720px',
}

const smallHeroBgStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  marginLeft: '-50%',
  bottom: '-150px',
  width: '100%',
  height: 'auto',
  zIndex: 0,
  opacity: 0.4,
  filter: 'blur(65px)'
}

const heroGradientBgStyle: CSSProperties = {
  width: '100vw',
  height: '150%',
  position: 'absolute',
  top: '-156px',
  left: 0,
  background: 'linear-gradient(rgb(234, 236, 255, 10%), rgb(145 151 204 / 34%), rgb(234, 236, 255, 0%))',
  zIndex: 0
}

export const styles = {
  SiteMonitoringHeader: (isSmall: boolean) => isSmall ? smallSiteMonitoringHeaderStyle : siteMonitoringHeaderStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  Cards: (isSmall: boolean) => isSmall ? smallCardsStyle : cardsStyle,
  Background: backgroundStyle,
  ChevronRight: chevronRightStyle,
  SiteMonitoringHeaderContent: siteMonitoringHeaderContentStyle,
  HeroBlueBg: heroBlueBgStyle,
  HeroOrangeBg: heroOrangeBgStyle,
  HeroMapBg: heroMapBgStyle,
  SmallHeroBg: smallHeroBgStyle,
  HeroGradientBg: heroGradientBgStyle,
}