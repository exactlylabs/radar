import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageCarrouselStyle: CSSProperties = {
  width: '100%'
}

const smallCarrouselContainerStyle: CSSProperties = {
  width: '100%',
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

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0
}

const carrouselContainerStyle: CSSProperties = {
  width: '100%',
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
  marginBottom: '50px'
}

export const styles = {
  MobilePageCarrousel: mobilePageCarrouselStyle,
  SmallCarrouselContainer: smallCarrouselContainerStyle,
  CarrouselImage: (isSmall: boolean) => isSmall ? smallCarrouselImageStyle : carrouselImageStyle,
  Icon: iconStyle,
  TextContainer: textContainerStyle,
  Header: headerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  CarrouselContainer: carrouselContainerStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  HorizontalCarrousel: horizontalCarrouselStyle,
  zIndex: 5
}