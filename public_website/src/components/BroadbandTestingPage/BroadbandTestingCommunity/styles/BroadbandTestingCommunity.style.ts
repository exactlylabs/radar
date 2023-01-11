import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, ITEM_ICON_CONTAINER_BLUE} from "../../../../utils/colors";

const broadbandTestingCommunityStyle: CSSProperties = {
  width: '100vw',
  height: '500px',
  marginTop: '80px',
  marginBottom: '100px',
}

const smallBroadbandTestingCommunityStyle: CSSProperties = {
  width: '100%',
  marginBottom: '30px'
}

const broadbandTestingCommunityContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: '0 auto'
}

const smallBroadbandTestingCommunityContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const textContainerStyle: CSSProperties = {
  width: '50%',
  maxWidth: '590px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center'
}

const smallTextContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center'
}

const rowStyle: CSSProperties = {
  width: '100%',
  height: '200px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const columnStyle: CSSProperties = {
  width: '25%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center'
}

const smallColumnStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center'
}

const iconContainerStyle: CSSProperties = {
  width: '64px',
  height: '64px',
  maxWidth: '64px',
  maxHeight: '64px',
  minWidth: '64px',
  minHeight: '64px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ITEM_ICON_CONTAINER_BLUE,
  borderRadius: '50%',
  marginBottom: '20px'
}

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
  minWidth: '34px',
  minHeight: '34px',
  maxWidth: '34px',
  maxHeight: '34px',
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 15px 0',
}

const smallHeaderStyle: CSSProperties = {
  ...headerStyle,
  margin: '0 0 10px 0'
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 50px 0',
}

const smallSubtitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 40px 0',
}

const rowTitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const smallRowTitleStyle: CSSProperties = {
  ...rowTitleStyle,
  margin: '0 0 5px 0'
}

const rowSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0,
}

const smallRowSubtitleStyle: CSSProperties = {
  ...rowSubtitleStyle,
  lineHeight: '26px',
  margin: '0 0 30px 0'
}

const verticalContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

export const styles = {
  BroadbandTestingCommunity: (isSmall: boolean) => isSmall ? smallBroadbandTestingCommunityStyle : broadbandTestingCommunityStyle,
  BroadbandTestingCommunityContent: (isSmall: boolean) => isSmall ? smallBroadbandTestingCommunityContentStyle : broadbandTestingCommunityContentStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  Row: rowStyle,
  Column: (isSmall: boolean) => isSmall ? smallColumnStyle : columnStyle,
  IconContainer: iconContainerStyle,
  Icon: iconStyle,
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  RowTitle: (isSmall: boolean) => isSmall ? smallRowTitleStyle : rowTitleStyle,
  RowSubtitle: (isSmall: boolean) => isSmall ? smallRowSubtitleStyle : rowSubtitleStyle,
  VerticalContainer: verticalContainerStyle,
}