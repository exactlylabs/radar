import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const broadbandTestingHeaderStyle: CSSProperties = {
  width: '100%',
  height: '380px',
  position: 'relative',
  marginTop: '90px',
  marginBottom: '80px',
}

const smallBroadbandTestingHeaderStyle: CSSProperties = {
  ...broadbandTestingHeaderStyle,
  height: undefined,
  marginTop: '50px',
  marginBottom: '60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
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

const smallTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '325px',
  margin: '0 auto 75px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}

const titleStyle: CSSProperties = {
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  color: DEFAULT_TEXT,
  margin: '75px 0 20px 0'
}

const smallTitleStyle: CSSProperties = {
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.6px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0',
  width: '100%',
  maxWidth: '100%'
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
  width: '100%',
  maxWidth: '100%'
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const illustrationStyle: CSSProperties = {
  maxWidth: '500px',
  width: '45%',
  height: 'auto',
  position: 'absolute',
  right: '25px',
  top: '10%'
}

const smallIllustrationStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxWidth: '352px',
  margin: '0 auto'
}

export const styles = {
  BroadbandTestingHeader: (isSmall: boolean) => isSmall ? smallBroadbandTestingHeaderStyle : broadbandTestingHeaderStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  ChevronRight: chevronRightStyle,
  Illustration: (isSmall: boolean) => isSmall ? smallIllustrationStyle : illustrationStyle,
}