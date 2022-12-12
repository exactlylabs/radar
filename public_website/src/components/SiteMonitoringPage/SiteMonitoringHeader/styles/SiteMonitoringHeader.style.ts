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

const textContainerStyle: CSSProperties = {
  maxWidth: '480px',
  maxHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const titleStyle: CSSProperties = {
  width: '480px',
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const subtitleStyle: CSSProperties = {
  width: '480px',
  fontSize: '18px',
  lineHeight: '28px',
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
  SiteMonitoringHeader: siteMonitoringHeaderStyle,
  TextContainer: textContainerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  Cards: cardsStyle,
  Background: backgroundStyle,
  ChevronRight: chevronRightStyle,
  RedShape: redShapeStyle,
  BlueShape: blueShapeStyle,
}