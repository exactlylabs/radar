import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const broadbandTestingHeaderStyle: CSSProperties = {
  width: '100%',
  height: '380px',
  position: 'relative',
  marginTop: '90px',
  marginBottom: '50px',
}

const smallBroadbandTestingHeaderStyle: CSSProperties = {
  ...broadbandTestingHeaderStyle,
  height: undefined,
  marginTop: '50px',
  marginBottom: '60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

const textContainerStyle: CSSProperties = {
  width: '35%',
  maxWidth: '480px',
  minWidth: '300px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
}

const smallTextContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
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
  margin: '50px 0 20px 0'
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
  marginRight: '-4px'
}

const illustrationStyle: CSSProperties = {
  maxWidth: '530px',
  width: '45%',
  minWidth: '450px',
  height: 'auto',
  position: 'absolute',
  right: 0,
  top: '-50px'
}

const smallIllustrationStyle: CSSProperties = {
  width: '75%',
  height: 'auto',
  maxWidth: '588px',
  margin: '50px auto 0',
  zIndex: 1,
  position: 'relative'
}

const broadbandTestingHeaderContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative'
}

const broadbandTestingMapStyle: CSSProperties = {
  position: 'absolute',
  maxWidth: '767px',
  minWidth: '450px',
  width: '53%',
  height: 'auto',
  right: 0,
  top: '-143px',
  boxShadow: '0 20px 20px 0 rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(25px)'
}

const smallBroadbandTestingMapStyle: CSSProperties = {
  position: 'absolute',
  width: '100%',
  maxWidth: '800px',
  height: 'auto',
  left: '50%',
  marginLeft: '-50%',
  bottom: '25px',
  zIndex: 0
}

const heroGradientBgStyle: CSSProperties = {
  width: '100vw',
  height: '150%',
  position: 'absolute',
  top: '-156px',
  left: 0,
  background: 'linear-gradient(rgba(234, 236, 255, 1) -51%, rgba(145, 151, 204, 0.34), rgba(234, 236, 255, -0.1));',
  zIndex: 0
}

export const styles = {
  BroadbandTestingHeader: (isSmall: boolean) => isSmall ? smallBroadbandTestingHeaderStyle : broadbandTestingHeaderStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  ChevronRight: chevronRightStyle,
  Illustration: (isSmall: boolean) => isSmall ? smallIllustrationStyle : illustrationStyle,
  BroadbandTestingHeaderContent: broadbandTestingHeaderContentStyle,
  BroadbandTestingMap: (isSmall: boolean) => isSmall ? smallBroadbandTestingMapStyle : broadbandTestingMapStyle,
  HeroGradientBg: heroGradientBgStyle,
}