import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, SPEED_TEST_BOX_SHADOW, WHITE} from "../../../../utils/colors";

const broadbandTestingSpeedtestStyle: CSSProperties = {
  width: '100%',
  height: '690px',
  backgroundImage: 'linear-gradient(0, rgba(211, 224, 255, 0.58), rgba(211, 224, 255, 0.28))'
}

const smallBroadbandTestingSpeedtestStyle: CSSProperties = {
  width: '100%',
  paddingTop: '40px',
  paddingBottom: '15px',
  backgroundImage: 'linear-gradient(0deg, rgba(211, 224, 255, 0.0), rgba(211, 224, 255, 0.88))'
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

const smallBroadbandTestingSpeedtestContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const leftColumnStyle: CSSProperties = {
  width: '40%',
  maxWidth: '445px',
  height: '100%',
  marginRight: '10%',
}

const smallLeftColumnStyle: CSSProperties = {
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const rightColumnStyle: CSSProperties = {
  width: '600px',
  height: '570px',
  backgroundColor: WHITE,
  boxShadow: `0 5px 10px 0 ${SPEED_TEST_BOX_SHADOW}`,
  position: 'relative'
}

const smallRightColumnStyle: CSSProperties = {
  width: '100%',
  maxWidth: '588px',
  height: '570px',
  backgroundColor: WHITE,
  boxShadow: `0 5px 10px 0 ${SPEED_TEST_BOX_SHADOW}`,
  marginTop: '50px',
  position: 'relative'
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
  margin: '0 0 50px 0',
}

const smallTitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 0 30px 0'
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  margin: '0 0 5px 0',
}

const paragraphStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: '0 0 25px 0',
}

const smallParagraphStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0',
}

const iframeStyle: CSSProperties = {
  width: '600px',
  height: '570px',
  border: 'none',
  boxShadow: `0 5px 10px 0 rgba(109, 106, 148, 0.1)`,
}

const smallIframeStyle: CSSProperties = {
  ...iframeStyle,
  width: '100%',
  height: '570px',
}

export const styles = {
  BroadbandTestingSpeedtest: (isSmall: boolean) => isSmall ? smallBroadbandTestingSpeedtestStyle : broadbandTestingSpeedtestStyle,
  BroadbandTestingSpeedtestContent: (isSmall: boolean) => isSmall ? smallBroadbandTestingSpeedtestContentStyle : broadbandTestingSpeedtestContentStyle,
  ChevronRight: chevronRightStyle,
  LeftColumn: (isSmall: boolean) => isSmall ? smallLeftColumnStyle : leftColumnStyle,
  RightColumn: (isSmall: boolean) => isSmall ? smallRightColumnStyle : rightColumnStyle,
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  Paragraph: (isSmall: boolean) => isSmall ? smallParagraphStyle : paragraphStyle,
  Iframe: (isSmall: boolean) => isSmall ? smallIframeStyle : iframeStyle,
}