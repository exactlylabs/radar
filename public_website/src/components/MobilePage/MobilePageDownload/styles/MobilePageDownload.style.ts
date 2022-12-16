import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageDownloadStyle: CSSProperties = {
  width: '90%',
  maxWidth: '588px',
  margin: '80px auto 180px',
  textAlign: 'center'
}

const smallMobilePageDownloadStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
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

export const styles = {
  MobilePageDownload: (isSmall: boolean) => isSmall ? smallMobilePageDownloadStyle : mobilePageDownloadStyle,
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
}