import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, SPEED_TEST_BOX_SHADOW, WHITE} from "../../../../utils/colors";

const broadbandTestingSpeedtestStyle: CSSProperties = {
  width: '100%',
  height: '690px',
}

const broadbandTestingSpeedtestContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '100px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '570px',
  paddingTop: '60px',
  paddingBottom: '60px',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const leftColumnStyle: CSSProperties = {
  width: '40%',
  maxWidth: '445px',
  height: '100%',
  marginRight: '10%',
}

const rightColumnStyle: CSSProperties = {
  width: '600px',
  height: '100%',
  backgroundColor: WHITE,
  boxShadow: `0 5px 10px 0 ${SPEED_TEST_BOX_SHADOW}`,
  borderRadius: '8px'
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
  margin: '0 0 50px 0',
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const paragraphStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 25px 0',
}

export const styles = {
  BroadbandTestingSpeedtest: broadbandTestingSpeedtestStyle,
  BroadbandTestingSpeedtestContent: broadbandTestingSpeedtestContentStyle,
  ChevronRight: chevronRightStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  Header: headerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  Paragraph: paragraphStyle,

}