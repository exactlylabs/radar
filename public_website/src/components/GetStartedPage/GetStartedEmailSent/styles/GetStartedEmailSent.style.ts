import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../utils/colors";

const getStartedEmailSentHeaderStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '85px auto 130px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2
}

const smallGetStartedEmailSentHeaderStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  margin: '30px auto 135px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2
}

const logoStyle: CSSProperties = {
  width: '80px',
  height: 'auto',
  margin: '0 auto 40px',
  zIndex: 2,
  position: 'relative'
}

const smallLogoStyle: CSSProperties = {
  width: '60px',
  height: 'auto',
  margin: '0 auto 20px',
  zIndex: 2,
  position: 'relative'
}

const buttonContainerStyle: CSSProperties = {
  width: '100%',
  margin: '0 auto 60px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  position: 'relative'
}

const smallButtonContainerStyle: CSSProperties = {
  ...buttonContainerStyle,
  margin: '0 auto 45px',
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  margin: '0 auto 20px',
  maxWidth: '588px',
  zIndex: 2,
  position: 'relative'
}

const smallTitleStyle: CSSProperties = {
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  color: DEFAULT_TEXT,
  margin: '0 auto 15px',
  zIndex: 2,
  position: 'relative'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 auto 30px',
  maxWidth: '588px',
  zIndex: 2,
  position: 'relative'
}

const smallSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 auto 25px',
  zIndex: 2,
  position: 'relative'
}

const horizontalDividerStyle: CSSProperties = {
  width: '200px',
  height: 'auto',
  margin: '0 auto 60px',
  zIndex: 2,
  position: 'relative'
}

const smallHorizontalDividerStyle: CSSProperties = {
  width: '200px',
  height: 'auto',
  margin: '0 auto 40px',
  zIndex: 2,
  position: 'relative'
}

const toolkitTitleStyle: CSSProperties = {
  fontSize: '22px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 auto 20px',
  maxWidth: '588px',
  zIndex: 2,
  position: 'relative'
}

const smallToolkitTitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 auto 5px',
  zIndex: 2,
  position: 'relative'
}

const toolkitSubtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 auto 20px',
  maxWidth: '588px',
  zIndex: 2,
  position: 'relative'
}

const smallToolkitSubtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 auto 40px',
  zIndex: 2,
  position: 'relative'
}

const pageWrapperStyle: CSSProperties = {
  width: '100vw',
  position: 'relative',
}

const contactBg1Style: CSSProperties = {
  position: 'absolute',
  width: '69%',
  height: 'auto',
  zIndex: 0,
  right: 0,
  top: '-140px',
  opacity: 0.6,
}

const contactBg2Style: CSSProperties = {
  position: 'absolute',
  width: '63%',
  height: 'auto',
  zIndex: 0,
  left: '10%',
  top: '-55px',
  opacity: 0.6,
  maxHeight: '70vh'
}

const contactWhiteCircleStyle: CSSProperties = {
  position: 'absolute',
  width: '100vw',
  height: 'auto',
  zIndex: 1,
  left: 0,
  top: '70px',
  maxHeight: '70vh'
}

const smallContactBg1Style: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 0,
  maxHeight: '50vh'
}

const smallContactBg2Style: CSSProperties = {
  width: '100vw',
  height: 'auto',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0,
  maxHeight: '50vh'
}

export const styles = {
  GetStartedEmailSentHeader: (isSmall: boolean) => isSmall ? smallGetStartedEmailSentHeaderStyle : getStartedEmailSentHeaderStyle,
  Logo: (isSmall: boolean) => isSmall ? smallLogoStyle : logoStyle,
  ButtonContainer: (isSmall: boolean) => isSmall ? smallButtonContainerStyle : buttonContainerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  HorizontalDivider: (isSmall: boolean) => isSmall ? smallHorizontalDividerStyle : horizontalDividerStyle,
  ToolkitTitle: (isSmall: boolean) => isSmall ? smallToolkitTitleStyle : toolkitTitleStyle,
  ToolkitSubtitle: (isSmall: boolean) => isSmall ? smallToolkitSubtitleStyle : toolkitSubtitleStyle,
  PageWrapper: pageWrapperStyle,
  ContactBg1: contactBg1Style,
  ContactBg2: contactBg2Style,
  ContactWhiteCircle: contactWhiteCircleStyle,
  SmallContactBg1: smallContactBg1Style,
  SmallContactBg2: smallContactBg2Style,
}