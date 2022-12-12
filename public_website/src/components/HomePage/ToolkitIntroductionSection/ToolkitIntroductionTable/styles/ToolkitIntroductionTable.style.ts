import {CSSProperties} from "react";
import {DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../../utils/colors";

const toolkitIntroductionTableStyle: CSSProperties = {
  width: 'max-content',
  maxWidth: '1000px',
  height: '200px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
}

const smallToolkitIntroductionTableStyle: CSSProperties = {
  ...toolkitIntroductionTableStyle,
  flexDirection: 'column',
  width: 'calc(100vw - 50px)',
  maxWidth: '445px',
  height: 'max-content',
  marginTop: '-20px'
}

const toolkitIntroductionTableColumnStyle: CSSProperties = {
  width: '280px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'space-evenly',
  textAlign: 'center'
}

const iconContainerStyle: CSSProperties = {
  width: '60px',
  height: '60px',
  minWidth: '60px',
  minHeight: '60px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: GET_STARTED_BUTTON_BG,
  margin: '0 auto 20px auto'
}

const smallIconContainerStyle: CSSProperties = {
  ...iconContainerStyle,
  margin: '0 auto 10px auto'
}

const iconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
}

const titleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_TEXT,
  margin: '0 0 7px 0',
}

const subtitleStyle: CSSProperties = {
  width: '278px',
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  margin: '0 0 30px 0',
}

const separatorLineStyle: CSSProperties = {
  height: '100%',
  width: '1px',
  objectFit: 'contain',
  margin: '0 4.5%'
}

export const styles = {
  ToolkitIntroductionTable: (isSmall: boolean) => {
    return isSmall ? smallToolkitIntroductionTableStyle : toolkitIntroductionTableStyle;
  },
  ToolkitIntroductionTableColumn: toolkitIntroductionTableColumnStyle,
  IconContainer: (isSmall: boolean) => {
    return isSmall ? smallIconContainerStyle : iconContainerStyle;
  },
  Icon: iconStyle,
  Title: titleStyle,
  Subtitle: (isSmall: boolean) => {
    return isSmall ? smallSubtitleStyle : subtitleStyle;
  },
  SeparatorLine: separatorLineStyle,
}