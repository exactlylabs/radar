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
  textAlign: 'center'
}

const textContainerStyle: CSSProperties = {
  maxWidth: '588px',
  marginBottom: '93px',
  zIndex: 1
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
  maxWidth: '100%'
}

const smallHeaderStyle: CSSProperties = {
  ...headerStyle,
  marginBottom: '10px',
}

const titleStyle: CSSProperties = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
  maxWidth: '100%'
}

const smallTitleStyle: CSSProperties = {
  ...titleStyle,
  fontSize: '26px',
  lineHeight: '34px',
  letterSpacing: '-0.56px',
  marginBottom: '15px',
  width: 'calc(100vw - 70px)',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const subtitleStyle: CSSProperties = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  maxWidth: '100%'
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  fontSize: '16px',
  width: 'calc(100vw - 50px)',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const informationBlockStyle: CSSProperties = {
  width: '40%',
  maxWidth: '381px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  textAlign: 'left',
  marginLeft: '10%',
  zIndex: 10,
  position: 'absolute'
}

const smallInformationBlockStyle: CSSProperties = {
  width: '325px',
  height: '250px',
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

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
}

const siteMonitoringBackgroundStyle: CSSProperties = {
  width: '1106px',
  height: '637px',
  position: 'absolute',
  bottom: '-10%',
  right: '-20%',
}

const smallSiteMonitoringBackgroundStyle: CSSProperties = {
  width: '150vw',
  height: 'auto',
  marginLeft: '-27vw',
  marginTop: '-70px'
}

const broadbandTestingBackgroundStyle: CSSProperties = {
  width: '60%',
  height: 'auto',
  position: 'absolute',
  top: '-150px',
  left: '-10%',
}

const smallBroadbandTestingBackgroundStyle: CSSProperties = {
  width: '100vw',
  height: 'auto',
  marginLeft: '-5vw',
  marginTop: '-70px',
  marginBottom: '-70px'
}

const mappingToolsBackgroundStyle: CSSProperties = {
  width: '70%',
  height: 'auto',
  position: 'absolute',
  right: '-7%',
  bottom: '-20%'
}

const smallMappingToolsBackgroundStyle: CSSProperties = {
  width: '140vw',
  height: 'auto',
  marginLeft: '-24vw',
  marginTop: '-70px'
}

const chevronStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px'
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
  zIndex: 0
}

const fillStyle: CSSProperties = {
  width: '100vw',
  position: 'absolute',
  bottom: '-100px',
  left: '50%',
  marginLeft: '-50vw',
}

export const styles = {
  ToolkitDetailSection: toolkitDetailSectionStyle,
  TextContainer: (isSmall: boolean) => isSmall ? smallTextContainerStyle : textContainerStyle,
  DetailSection: (isSmall: boolean) => isSmall ? smallDetailSectionStyle : detailSectionStyle,
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
  IconContainer: iconContainerStyle,
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
  }
}