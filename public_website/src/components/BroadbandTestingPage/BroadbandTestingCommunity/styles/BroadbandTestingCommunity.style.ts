import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, ITEM_ICON_CONTAINER_BLUE} from "../../../../utils/colors";

const broadbandTestingCommunityStyle: CSSProperties = {
  width: '100vw',
  height: '500px',
  marginTop: '80px',
  marginBottom: '100px',
}

const broadbandTestingCommunityContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center'
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

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 50px 0',
}

const rowTitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const rowSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0,
}

export const styles = {
  BroadbandTestingCommunity: broadbandTestingCommunityStyle,
  BroadbandTestingCommunityContent: broadbandTestingCommunityContentStyle,
  TextContainer: textContainerStyle,
  Row: rowStyle,
  Column: columnStyle,
  IconContainer: iconContainerStyle,
  Icon: iconStyle,
  Header: headerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  RowTitle: rowTitleStyle,
  RowSubtitle: rowSubtitleStyle,
}