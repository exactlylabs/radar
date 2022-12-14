import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageHeaderStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}


const textContainerStyle: CSSProperties = {
  width: '40%',
  maxWidth: '478px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const titleStyle: CSSProperties = {
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 40px 0'
}

const heroImageStyle: CSSProperties = {
  width: '582px',
  height: 'auto'
}

export const styles = {
  MobilePageHeader: mobilePageHeaderStyle,
  TextContainer: textContainerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  HeroImage: heroImageStyle,
}