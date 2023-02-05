import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../utils/colors";

const toolkitDetailSectionStyle: CSSProperties = {
  width: '100vw',
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  zIndex: 3
}

const textContainerStyle: CSSProperties = {
  maxWidth: '588px',
  marginBottom: '93px',
  zIndex: 3
}

const smallTextContainerStyle: CSSProperties = {
  maxWidth: '588px',
  marginBottom: '40px'
}

const detailSectionStyle: CSSProperties = {
  width: '100%',
  height: '385px',
  position: 'relative',
  marginBottom: '150px',
}

const smallDetailSectionStyle: CSSProperties = {
  width: '100vw',
  height: 'max-content',
  marginBottom: 0,
}

const headerStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  marginBottom: '15px',
  maxWidth: '100%',
  margin: '0 0 15px 0'
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
  maxWidth: '100%'
}

const smallTitleStyle: CSSProperties = {
  ...titleStyle,
  width: 'calc(100vw - 70px)',
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  margin: '0 auto 15px'
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  maxWidth: '100%',
  margin: '0'
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  fontSize: '16px',
  width: 'calc(100vw - 50px)',
  margin: '0 auto'
}

const informationBlockStyle: CSSProperties = {
  width: '40%',
  maxWidth: '381px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  textAlign: 'left',
  marginLeft: '8.5%',
  zIndex: 10,
  position: 'absolute'
}

const smallInformationBlockStyle: CSSProperties = {
  width: '90%',
  maxWidth: '588px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginLeft: 'auto',
  marginRight: 'auto',
  zIndex: 10,
  marginBottom: '20px',
}

const iconContainerStyle: CSSProperties = {
  width: '60px',
  height: '60px',
  minHeight: '60px',
  minWidth: '60px',
  maxWidth: '60px',
  maxHeight: '60px',
  backgroundColor: GET_STARTED_BUTTON_BG,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  marginBottom: '19px'
}

const smallIconContainerStyle: CSSProperties = {
  ...iconContainerStyle,
  marginBottom: '10px'
}

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
}

const siteMonitoringBackgroundStyle: CSSProperties = {
  width: '65vw',
  maxWidth: '1106px',
  height: 'auto',
  position: 'absolute',
  bottom: '0',
  right: '-6vw',
  zIndex: 5
}

const smallSiteMonitoringBackgroundStyle: CSSProperties = {
  width: '190vw',
  height: 'auto',
  marginLeft: '-52vw',
  marginTop: '-70px',
  zIndex: 5
}

const broadbandTestingBackgroundStyle: CSSProperties = {
  width: '60%',
  height: 'auto',
  position: 'absolute',
  top: '-200px',
  left: '-7%',
  zIndex: 5
}

const smallBroadbandTestingBackgroundStyle: CSSProperties = {
  width: '125vw',
  height: 'auto',
  marginLeft: '-17vw',
  marginTop: '-70px',
  marginBottom: '-70px',
  zIndex: 5
}

const mappingToolsBackgroundStyle: CSSProperties = {
  width: '79%',
  height: 'auto',
  position: 'absolute',
  right: '-9%',
  bottom: '-23%',
  zIndex: 5,
}

const smallMappingToolsBackgroundStyle: CSSProperties = {
  width: '135vw',
  height: 'auto',
  marginLeft: '-20vw',
  zIndex: 5
}

const chevronStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const redirectArrowWhite: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const informationBlockTitleStyle: CSSProperties = {
  fontSize: '22px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 10px 0',
}

const smallInformationBlockTitleStyle: CSSProperties = {
  ...informationBlockTitleStyle,
  fontSize: '18px',
  margin: '0 0 5px 0',
}

const informationBlockSubtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 25px 0',
}

const smallInformationBlockSubtitleStyle: CSSProperties = {
  ...informationBlockSubtitleStyle,
  fontSize: '16px',
  margin: '0 0 20px 0'
}

const gradientStyle: CSSProperties = {
  width: '100vw',
  position: 'absolute',
  bottom: 0,
  left: '50%',
  marginLeft: '-50vw',
  zIndex: 2
}

const fillStyle: CSSProperties = {
  width: '100vw',
  position: 'absolute',
  bottom: '-100px',
  left: '50%',
  marginLeft: '-50vw',
  zIndex: 5
}

export const styles = {
  ToolkitDetailSection: toolkitDetailSectionStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  DetailSection: (isSmall: boolean, isLast?: boolean) => {
    let style = isSmall ? smallDetailSectionStyle : detailSectionStyle;
    if(isLast) style = {...style, marginBottom: '120px'};
    return style;
  },
  InformationBlock: (isSmall: boolean, right?: string) => {
    if(isSmall) return smallInformationBlockStyle;
    if(right) {
      return {...informationBlockStyle, left: undefined, right};
    } else {
      return informationBlockStyle;
    }
  },
  Header: (isSmall: boolean) => isSmall ? smallHeaderStyle : headerStyle,
  Title: (isSmall: boolean) => isSmall ? smallTitleStyle : titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
  IconContainer: (isSmall: boolean) => isSmall ? smallIconContainerStyle : iconContainerStyle,
  Icon: iconStyle,
  SiteMonitoringBackground: (isSmall: boolean) => isSmall ? smallSiteMonitoringBackgroundStyle : siteMonitoringBackgroundStyle,
  BroadbandTestingBackground: broadbandTestingBackgroundStyle,
  SmallBroadbandTestingBackground: smallBroadbandTestingBackgroundStyle,
  MappingToolsBackground: (isSmall: boolean) => isSmall ? smallMappingToolsBackgroundStyle : mappingToolsBackgroundStyle,
  Chevron: chevronStyle,
  InformationBlockTitle: (isSmall: boolean) => isSmall ? smallInformationBlockTitleStyle : informationBlockTitleStyle,
  InformationBlockSubtitle: (isSmall: boolean) => isSmall ? smallInformationBlockSubtitleStyle : informationBlockSubtitleStyle,
  Gradient: (height: string, backgroundImage: string) => {
    return {...gradientStyle, height, backgroundImage};
  },
  Fill: (height: string, backgroundColor: string) => {
    return {...fillStyle, height, backgroundColor};
  },
  RedirectArrow: redirectArrowWhite,
}