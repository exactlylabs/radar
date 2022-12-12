import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const broadbandTestingHeaderStyle: CSSProperties = {
  width: '100%',
  height: '380px',
  position: 'relative',
  marginTop: '90px',
  marginBottom: '80px',
}

const textContainerStyle: CSSProperties = {
  width: '480px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
}

const titleStyle: CSSProperties = {
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '75px 0 20px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const illustrationStyle: CSSProperties = {
  width: '513px',
  height: '435px',
  position: 'absolute',
  right: '25px',
  top: 0
}

export const styles = {
  BroadbandTestingHeader: broadbandTestingHeaderStyle,
  TextContainer: textContainerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  ChevronRight: chevronRightStyle,
  Illustration: illustrationStyle,
}