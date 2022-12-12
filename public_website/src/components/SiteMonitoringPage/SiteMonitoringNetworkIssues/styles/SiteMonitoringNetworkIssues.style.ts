import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, ITEM_ICON_CONTAINER_RED} from "../../../../utils/colors";

const siteMonitoringNetworkIssuesStyle: CSSProperties = {
  width: '100%',
  height: '685px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '85px',
}

const textContainerStyle: CSSProperties = {
  width: '590px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '20px',
  textAlign: 'center'
}

const itemsContainerStyle: CSSProperties = {
  width: 'calc(100% - 20%)',
  margin: '35px auto 80px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const itemStyle: CSSProperties = {
  width: '278px',
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
}

const itemIconContainer: CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: ITEM_ICON_CONTAINER_RED,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const wavesStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxWidth: '1300px',
  maxHeight: '150px',
}

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
}

const networkIssuesTextStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 15px 0'
}

const mainTitleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const itemTitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '20px 0 7px 0',
}

const itemSubtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0,
}

const mainSubtitleStyle: CSSProperties = {
  width: '590px',
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

export const styles = {
  SiteMonitoringNetworkIssues: siteMonitoringNetworkIssuesStyle,
  TextContainer: textContainerStyle,
  ItemsContainer: itemsContainerStyle,
  Item: itemStyle,
  ItemIconContainer: itemIconContainer,
  Waves: wavesStyle,
  Icon: iconStyle,
  NetworkIssuesText: networkIssuesTextStyle,
  MainTitle: mainTitleStyle,
  MainSubtitle: mainSubtitleStyle,
  ItemTitle: itemTitleStyle,
  ItemSubtitle: itemSubtitleStyle,
}