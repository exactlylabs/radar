import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageCarrouselStyle: CSSProperties = {
  width: '100%'
}

const carrouselImageStyle: CSSProperties = {
  width: '300px',
  height: 'auto'
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

export const styles = {
  MobilePageCarrousel: mobilePageCarrouselStyle,
  CarrouselImage: carrouselImageStyle,
  Icon: iconStyle,
  TextContainer: textContainerStyle,
  Header: headerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  CarrouselContainer: carrouselContainerStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
}