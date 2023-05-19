import {CSSProperties} from "react";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, PILL, PILL_BG} from "../../../../utils/colors";

const mobilePageDownloadStyle: CSSProperties = {
  width: '90%',
  maxWidth: '588px',
  margin: '160px auto 180px',
  textAlign: 'center'
}

const smallMobilePageDownloadStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  margin: '60px auto',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  margin: '0 0 15px 0',
  color: DEFAULT_SECONDARY_TEXT
}

const smallHeaderStyle: CSSProperties = {
  ...headerStyle,
  margin: '0 0 10px 0',
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  margin: '0 0 22px 0',
  color: DEFAULT_TEXT
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  margin: '0 0 15px 0',
  color: DEFAULT_TEXT
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  margin: 0,
  color: DEFAULT_TEXT
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: 0,
  color: DEFAULT_TEXT,
  width: '100%',
}

const comingSoonPillStyle: CSSProperties = {
  width: '121px',
  height: '28px',
  borderRadius: '17px',
  backgroundColor: PILL,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: `0 4px 30px -2px ${PILL_BG}`,
  margin: '0 auto 21px'
}

const comingSoonPillTextStyle: CSSProperties = {
  fontSize: '13px',
  lineHeight: '28px',
  color: DEFAULT_PRIMARY_BUTTON
}

const comingSoonContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '5px',
  marginTop: '30px',
  justifyContent: 'center',
  alignItems: 'center',
}

const storesIconStyle: CSSProperties = {
  width: '54px',
  height: 'auto',
  marginBottom: '5px'
}

const comingSoonTextStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#6d6a94',
  margin: 0
}

export const styles = {
  MobilePageDownload: (isSmall: boolean) => isSmall ? smallMobilePageDownloadStyle : mobilePageDownloadStyle,
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  ComingSoonPill: comingSoonPillStyle,
  ComingSoonPillText: comingSoonPillTextStyle,
  ComingSoonContainer: comingSoonContainerStyle,
  StoresIcon: storesIconStyle,
  ComingSoonText: comingSoonTextStyle,
}