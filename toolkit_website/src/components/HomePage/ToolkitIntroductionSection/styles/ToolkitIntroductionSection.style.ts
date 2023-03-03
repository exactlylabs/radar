import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../utils/colors";

const mainWrapperStyle: CSSProperties = {
  width: '100vw',
  height: 'max-content',
  position: 'relative',
}

const toolkitIntroductionSectionStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
  position: 'relative'
}

const smallToolkitIntroductionSectionStyle: CSSProperties = {
  ...toolkitIntroductionSectionStyle,
  width: 'calc(100vw - 50px)',
}

const textContainerStyle: CSSProperties = {
  width: '588px',
  marginLeft: '25%',
  marginRight: '25%',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2
}

const smallTextContainerStyle: CSSProperties = {
  ...textContainerStyle,
  width: undefined,
  maxWidth: '100%',
  marginRight: 'auto',
  marginLeft: 'auto',
  margin: 0,
  position: 'relative',
  zIndex: 5
}

const titleStyle: CSSProperties = {
  fontSize: '42px',
  lineHeight: '48px',
  letterSpacing: '-1px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
  marginTop: '100px',
}

const smallTitleStyle: CSSProperties = {
  ...titleStyle,
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.6px',
  marginBottom: undefined,
  marginTop: undefined,
  margin: '35px auto 15px auto',
  width: '100%',
  maxWidth: '588px',
  position: 'relative',
  zIndex: 2
}

const subtitleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '28px',
  textAlign: 'center',
  color: DEFAULT_TEXT,
  margin: '0 0 20px 0'
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  fontSize: '16px',
  lineHeight: '26px',
  width: '100%',
  maxWidth: '445px',
  position: 'relative',
  zIndex: 2
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const buttonContainerStyle: CSSProperties = {
  width: 'max-content',
  height: 'max-content',
  margin: 'auto',
  marginBottom: '70px',
  position: 'relative',
  zIndex: 2
}

const blueHeroBgStyle: CSSProperties = {
  position: 'absolute',
  top: '-50px',
  left: '-100px',
  zIndex: 0,
  width: '800px',
  height: 'auto',
  filter: 'blur(50px)'
}

const smallBlueHeroBgStyle: CSSProperties = {
  ...blueHeroBgStyle,
  width: '100%',
  top: 0,
  left: '-25px',
  opacity: 0.9
}

const pinkHeroBgStyle: CSSProperties = {
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  zIndex: 0,
  width: '500px',
  height: 'auto',
  filter: 'blur(50px)'
}

const smallPinkHeroBgStyle: CSSProperties = {
  ...pinkHeroBgStyle,
  width: '100%',
  top: 0,
  right: '-100px',
  opacity: 0.9
}

const orangeHeroBgStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '60%',
  zIndex: 0,
  marginLeft: '-500px',
  width: '1000px',
  height: 'auto',
  filter: 'blur(50px)'
}

const smallOrangeHeroBgStyle: CSSProperties = {
  ...orangeHeroBgStyle,
  width: '100%',
  left: 0,
  top: 0,
  marginLeft: undefined,
  opacity: 0.9
}

const mapBgStyle: CSSProperties = {
  width: '120vw',
  height: 'auto',
  position: 'absolute',
  left: 0,
  top: '-55px',
}

const smallMapBgStyle: CSSProperties = {
  width: 'auto',
  height: '35%',
  position: 'absolute',
  left: 0,
  top: '-62px',
  backgroundSize: 'cover'
}

const whiteCircle: CSSProperties = {
  position: 'absolute',
  width: '100vw',
  height: '200vw',
  zIndex: 1,
  top: '40%',
  maxHeight: '200vh'
}

const smallWhiteCircle: CSSProperties = {
  position: 'absolute',
  width: '100vw',
  height: '200vw',
  zIndex: 2,
  top: '23%',
  maxHeight: '87vh'
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
  BlueHeroBg: (isSmall: boolean) => isSmall ? smallBlueHeroBgStyle : blueHeroBgStyle,
  PinkHeroBg: (isSmall: boolean) => isSmall ? smallPinkHeroBgStyle : pinkHeroBgStyle,
  OrangeHeroBg: (isSmall: boolean) => isSmall ? smallOrangeHeroBgStyle : orangeHeroBgStyle,
  MainWrapper: mainWrapperStyle,
  MapBg: (isSmall: boolean) => {
    let style = mapBgStyle;
    if(isSmall) style = smallMapBgStyle;
    return style;
  },
  WhiteCircle: (isSmall: boolean) => isSmall ? smallWhiteCircle : whiteCircle,
}