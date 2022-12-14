import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const mobilePageDownloadStyle: CSSProperties = {
  width: '90%',
  maxWidth: '588px',
  margin: '80px auto 180px',
  textAlign: 'center'
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  margin: '0 0 15px 0',
  color: DEFAULT_SECONDARY_TEXT
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  margin: '0 0 22px 0',
  color: DEFAULT_TEXT
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  margin: 0,
  color: DEFAULT_TEXT
}

export const styles = {
  MobilePageDownload: mobilePageDownloadStyle,
  Header: headerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
}