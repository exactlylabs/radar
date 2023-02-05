import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const broadbandTestingMobileStyle: CSSProperties = {
  width: '100%',
  paddingTop: '105px',
  paddingBottom: '215px',
}

const smallBroadbandTestingMobileStyle: CSSProperties = {
  width: '100%',
  marginTop: '40px',
  marginBottom: '30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}

const broadbandTestingMobileContentStyle: CSSProperties = {
  width: '95%',
  maxWidth: '1200px',
  height: '455px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
  position: 'relative'
}

const smallBroadbandTestingMobileContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '588px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '25px'
}

const illustrationStyle: CSSProperties = {
  width: '45%',
  height: 'auto',
  marginTop: '60px',
  position: 'absolute',
  left: '75px',
}

const smallIllustrationStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxWidth: '588px',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '58px 0 15px 0',
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
  margin: '0 0 25px 0',
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 0 15px 0',
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

const rightColumnStyle: CSSProperties = {
  width: '445px',
  textAlign: 'left',
  position: 'absolute',
  right: '40px'
}

const smallRightColumnStyle: CSSProperties = {
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

export const styles = {
  BroadbandTestingMobile: (isSmall: boolean) => isSmall ? smallBroadbandTestingMobileStyle : broadbandTestingMobileStyle,
  BroadbandTestingMobileContent: (isSmall: boolean) => isSmall ? smallBroadbandTestingMobileContentStyle : broadbandTestingMobileContentStyle,
  Illustration: (isSmall: boolean) => isSmall ? smallIllustrationStyle : illustrationStyle,
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Paragraph: (isSmall: boolean) => isSmall ? smallParagraphStyle : paragraphStyle,
  ChevronRight: chevronRightStyle,
  RightColumn: (isSmall: boolean) => isSmall ? smallRightColumnStyle : rightColumnStyle,
}