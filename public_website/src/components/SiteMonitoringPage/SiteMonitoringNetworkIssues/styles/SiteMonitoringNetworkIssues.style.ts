import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, ITEM_ICON_CONTAINER_RED} from "../../../../utils/colors";

const siteMonitoringNetworkIssuesStyle: CSSProperties = {
  width: '100%',
  height: '685px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '95px',
}

const smallSiteMonitoringNetworkIssuesStyle: CSSProperties = {
  ...siteMonitoringNetworkIssuesStyle,
  height: undefined,
  marginTop: 0,
  width: '90%',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const textContainerStyle: CSSProperties = {
  width: '590px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '30px',
  textAlign: 'center'
}

const smallTextContainerStyle: CSSProperties = {
  ...textContainerStyle,
  width: '100%',
  marginBottom: '5px',
  maxWidth: '588px',
}

const itemsContainerStyle: CSSProperties = {
  width: '85%',
  maxWidth: '1000px',
  margin: '35px auto 80px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const smallItemsContainerStyle: CSSProperties = {
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const itemStyle: CSSProperties = {
  width: '278px',
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center'
}

const smallItemStyle: CSSProperties = {
  ...itemStyle,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '30px',
  width: 'calc(100% - 50px)',
  height: 'auto',
  maxWidth: '588px',
}

const itemIconContainer: CSSProperties = {
  width: '64px',
  height: '64px',
  minWidth: '64px',
  minHeight: '64px',
  maxHeight: '64px',
  maxWidth: '64px',
  borderRadius: '50%',
  backgroundColor: ITEM_ICON_CONTAINER_RED,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const wavesStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxWidth: '1200px',
  maxHeight: '150px',
}

const smallWavesStyle: CSSProperties = {
  width: '300vw',
  maxWidth: '850px',
  marginBottom: '50px'
}

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
  minWidth: '34px',
  minHeight: '34px',
  maxWidth: '34px',
  maxHeight: '34px',
}

const networkIssuesTextStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 15px 0'
}

const smallNetworkIssuesTextStyle: CSSProperties = {
  ...networkIssuesTextStyle,
  margin: '0 0 10px 0',
}

const mainTitleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const smallMainTitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0'
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

const smallMainSubtitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: 0,
}

export const styles = {
  SiteMonitoringNetworkIssues: (isSmall: boolean) => isSmall ? smallSiteMonitoringNetworkIssuesStyle : siteMonitoringNetworkIssuesStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  ItemsContainer: (isSmall: boolean) => isSmall ? smallItemsContainerStyle : itemsContainerStyle,
  Item: (isSmall: boolean) => isSmall ? smallItemStyle : itemStyle,
  ItemIconContainer: itemIconContainer,
  Waves: (isSmall: boolean) => isSmall ? smallWavesStyle : wavesStyle,
  Icon: iconStyle,
  NetworkIssuesText: (isSmall: boolean) => isSmall ? smallNetworkIssuesTextStyle : networkIssuesTextStyle,
  MainTitle: (isSmall: boolean) => isSmall ? smallMainTitleStyle : mainTitleStyle,
  MainSubtitle: (isSmall: boolean) => isSmall ? smallMainSubtitleStyle : mainSubtitleStyle,
  ItemTitle: itemTitleStyle,
  ItemSubtitle: itemSubtitleStyle,
}