import {CSSProperties} from "react";
import {INVESTMENT_SECTION_BLUE, INVESTMENT_SECTION_BLUE_BOX_SHADOW, WHITE} from "../../../../utils/colors";

const radarRedirectStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1200px',
  borderRadius: '20px',
  height: '245px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  boxShadow: `0 14px 40px -4px ${INVESTMENT_SECTION_BLUE_BOX_SHADOW}`,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '-175px',
  position: 'relative',
  zIndex: 10
}

const smallRadarRedirectStyle: CSSProperties = {
  width: '100vw',
  height: '285px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  position: 'relative',
  marginBottom: '-25px',
  zIndex: 10
}

const siteMonitoringRadarRedirectContentStyle: CSSProperties = {
  width: '95%',
  maxWidth: '500px',
  height: '150px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '50px'
}

const smallSiteMonitoringRadarRedirectContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '40px',
  paddingBottom: '55px'
}

const titleStyle: CSSProperties = {
  fontSize: '30px',
  lineHeight: '42px',
  letterSpacing: '-0.62px',
  color: WHITE,
  margin: '0 0 10px 0'
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: WHITE,
  margin: '0 0 10px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: WHITE,
  margin: '0 0 30px 0',
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: WHITE,
  margin: '0 0 20px 0',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const bg1Style: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '54%',
  height: '100%',
}

const bg2Style: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 0,
  marginLeft: '-41%',
  width: '82%',
  height: '100%',
}

const bg3Style: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '63%',
  height: '100%',
}

const bg4Style: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '36%',
  height: '100%',
}

const bg5Style: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '60%',
  height: '100%',
}

const semiCircleSmallStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '34%',
  height: '100%',
  zIndex: 1
}

const semiCircleBigStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 0,
  width: '83%',
  marginLeft: '-41.5%',
  height: '100%',
  zIndex: 0
}

const SmallBg1Style: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '67%',
  zIndex: 1
}

const SmallBg2Style: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 0,
  width: '100%',
  marginLeft: '-50%',
  zIndex: 0
}

const SmallBg3Style: CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '58%',
  zIndex: 1
}

const SmallBg4Style: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '15%',
  zIndex: 1,
  height: '100%'
}

const smallSemiCircleBigStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '45%',
  zIndex: 0
}

export const styles = {
  RadarRedirect: (isSmall: boolean, marginTop?: string) => {
    let style = isSmall ? smallRadarRedirectStyle : radarRedirectStyle;
    if(!isSmall && marginTop) style = {...style, marginTop};
    return style;
  },
  RadarRedirectContent: (isSmall: boolean) => isSmall ? smallSiteMonitoringRadarRedirectContentStyle : siteMonitoringRadarRedirectContentStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  ChevronRight: chevronRightStyle,
  Bg1: bg1Style,
  Bg2: bg2Style,
  Bg3: bg3Style,
  Bg4: bg4Style,
  Bg5: bg5Style,
  SemiCircleSmall: semiCircleSmallStyle,
  SemiCircleBig: semiCircleBigStyle,
  SmallBg1: SmallBg1Style,
  SmallBg2: SmallBg2Style,
  SmallBg3: SmallBg3Style,
  SmallBg4: SmallBg4Style,
  SmallSemiCircleBig: smallSemiCircleBigStyle,
}