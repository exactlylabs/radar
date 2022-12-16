import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const siteMonitoringHeaderStyle: CSSProperties = {
  width: '100%',
  height: '340px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '120px',
  position: 'relative'
}

const smallSiteMonitoringHeaderStyle: CSSProperties = {
  ...siteMonitoringHeaderStyle,
  height: undefined,
  flexDirection: 'column',
  marginTop: '50px',
}

const textContainerStyle: CSSProperties = {
  maxWidth: '480px',
  maxHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const smallTextContainerStyle: CSSProperties = {
  ...textContainerStyle,
  maxWidth: '80%',
  maxHeight: undefined,
  textAlign: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const titleStyle: CSSProperties = {
  width: '480px',
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
  margin: '0 0 15px 0'
}

const subtitleStyle: CSSProperties = {
  width: '480px',
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
  width: '395px',
  height: '340px',
  position: 'absolute',
  right: '80px',
  top: 0,
  zIndex: 1,
}

const smallCardsStyle: CSSProperties = {
  width: '90vw',
  height: 'auto',
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

const redShapeStyle: CSSProperties = {
  width: '800px',
  height: '660px',
  position: 'absolute',
  right: 0,
  top: '120px',
  zIndex: 0
}

const blueShapeStyle: CSSProperties = {
  width: '1074px',
  height: '545px',
  position: 'absolute',
  right: '75px',
  top: '240px',
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
  RedShape: redShapeStyle,
  BlueShape: blueShapeStyle,
}