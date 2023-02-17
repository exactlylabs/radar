import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageCarrouselStyle: CSSProperties = {
  width: '100%',
  position: 'relative'
}

const smallCarrouselContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}

const carrouselImageStyle: CSSProperties = {
  width: '300px',
  height: 'auto'
}

const smallCarrouselImageStyle: CSSProperties = {
  width: '70%',
  height: 'auto',
  maxWidth: '200px',
  marginRight: 'auto',
  marginLeft: 'auto'
}

const iconStyle: CSSProperties = {
  width: '30px',
  height: '30px'
}

const textContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  margin: '0 auto 60px'
}

const smallTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  margin: '0 auto 60px'
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 15px 0',
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: 0
}

const carrouselContainerStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const leftColumnStyle: CSSProperties = {
  width: '40%',
  maxWidth: '340px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const rightColumnStyle: CSSProperties = {
  width: '40%',
  maxWidth: '340px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const horizontalCarrouselStyle: CSSProperties = {
  width: 'calc(100% + 50px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  overflowX: 'scroll',
  overflowY: 'hidden',
  marginTop: '30px',
  marginBottom: '50px',
  scrollBehavior: 'smooth'
}

const largeHorizontalCarrouselStyle: CSSProperties = {
  ...horizontalCarrouselStyle,
  width: 'calc(100% + 50px)',
}

const gradientBgStyle: CSSProperties = {
  width: '100vw',
  height: '100%',
  position: 'absolute',
  top: '80px',
  left: 0,
  background: 'linear-gradient(rgba(234, 236, 255, 0.1), rgba(145, 151, 204, 0.34))',
  zIndex: 0
}

export const styles = {
  MobilePageCarrousel: mobilePageCarrouselStyle,
  SmallCarrouselContainer: smallCarrouselContainerStyle,
  CarrouselImage: (isSmall: boolean) => isSmall ? smallCarrouselImageStyle : carrouselImageStyle,
  Icon: iconStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Header: headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  CarrouselContainer: carrouselContainerStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  HorizontalCarrousel: (isLarge: boolean) => isLarge ? largeHorizontalCarrouselStyle : horizontalCarrouselStyle,
  GradientBg: gradientBgStyle
}