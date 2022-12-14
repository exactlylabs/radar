import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../utils/colors";

const siteMonitoringBulletPointsStyle: CSSProperties = {
  width: '100%',
  height: '745px',
}

const siteMonitoringBulletPointsContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  height: 'calc(100% - 270px)',
  margin: '80px auto 190px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const leftColumnStyle: CSSProperties = {
  width: '45%',
  maxWidth: '525px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const rightColumnStyle: CSSProperties = {
  width: '50%',
  maxWidth: '580px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  height: '90%',
  marginTop: '45px'
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
  margin: '0 0 55px 0',
}

const cardsStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
}

const rowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

const rowIconContainerStyle: CSSProperties = {
  width: '60px',
  height: '60px',
  maxWidth: '60px',
  maxHeight: '60px',
  minWidth: '60px',
  minHeight: '60px',
  backgroundColor: GET_STARTED_BUTTON_BG,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '25px',
  borderRadius: '50%'
}

const rowIconStyle: CSSProperties = {
  width: '34px',
  height: '34px'
}

const rowTextContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left'
}

const rowTitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const rowSubtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0,
}

export const styles = {
  SiteMonitoringBulletPoints: siteMonitoringBulletPointsStyle,
  SiteMonitoringBulletPointsContent: siteMonitoringBulletPointsContentStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  Header: headerStyle,
  Title: titleStyle,
  Cards: cardsStyle,
  Row: rowStyle,
  RowIconContainer: rowIconContainerStyle,
  RowIcon: rowIconStyle,
  RowTextContainer: rowTextContainerStyle,
  RowTitle: rowTitleStyle,
  RowSubtitle: rowSubtitleStyle,

}