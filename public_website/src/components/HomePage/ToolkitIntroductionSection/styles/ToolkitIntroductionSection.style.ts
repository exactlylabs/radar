import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const toolkitIntroductionSectionStyle: CSSProperties = {
  maxWidth: '1300px',
  marginLeft: 'auto',
  marginRight: 'auto',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const smallToolkitIntroductionSectionStyle: CSSProperties = {
  ...toolkitIntroductionSectionStyle,
  width: 'calc(100vw - 50px)',
}

const textContainerStyle: CSSProperties = {
  maxWidth: '588px',
  marginLeft: '25%',
  marginRight: '25%',
  textAlign: 'center'
}

const smallTextContainerStyle: CSSProperties = {
  ...textContainerStyle,
  maxWidth: '100%',
  margin: 0,
}

const titleStyle: CSSProperties = {
  fontSize: '42px',
  lineHeight: '48px',
  letterSpacing: '-1px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
  marginTop: '120px',
}

const smallTitleStyle: CSSProperties = {
  ...titleStyle,
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.6px',
  margin: '50px auto 15px auto',
  width: 'calc(100% - 20px)',
  maxWidth: '425px',
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  textAlign: 'center',
  color: DEFAULT_TEXT,
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  fontSize: '16px',
  lineHeight: '26px',
  width: '100%',
  maxWidth: '445px',
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
}

const buttonContainerStyle: CSSProperties = {
  width: 'max-content',
  height: 'max-content',
  margin: 'auto',
  marginBottom: '70px'
}

export const styles = {
  ToolkitIntroductionSection: (isSmall: boolean) => {
    return isSmall ? smallToolkitIntroductionSectionStyle : toolkitIntroductionSectionStyle;
  },
  TextContainer: (isSmall: boolean) => {
    return isSmall ? smallTextContainerStyle : textContainerStyle;
  },
  Title: (isSmall: boolean) => {
    return isSmall ? smallTitleStyle : titleStyle;
  },
  Subtitle: (isSmall: boolean) => {
    return isSmall ? smallSubtitleStyle : subtitleStyle;
  },
  ChevronRight: chevronRightStyle,
  ButtonContainer: buttonContainerStyle,
}