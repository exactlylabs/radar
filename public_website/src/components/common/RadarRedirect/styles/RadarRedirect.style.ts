import {CSSProperties} from "react";
import {INVESTMENT_SECTION_BLUE, INVESTMENT_SECTION_BLUE_BOX_SHADOW, WHITE} from "../../../../utils/colors";

const radarRedirectStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1200px',
  borderRadius: '20px',
  height: '245px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  boxShadow: `0 14px 40px -4px ${INVESTMENT_SECTION_BLUE_BOX_SHADOW}`,
  margin: '-100px auto 85px'
}

const smallRadarRedirectStyle: CSSProperties = {
  width: '100vw',
  height: '285px',
  backgroundColor: INVESTMENT_SECTION_BLUE,
  margin: '0 auto 50px -25px'
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
  maxWidth: '375px',
  minHeight: '285px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '40px'
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
}

export const styles = {
  RadarRedirect: (isSmall: boolean) => isSmall ? smallRadarRedirectStyle : radarRedirectStyle,
  RadarRedirectContent: (isSmall: boolean) => isSmall ? smallSiteMonitoringRadarRedirectContentStyle : siteMonitoringRadarRedirectContentStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  ChevronRight: chevronRightStyle,
}