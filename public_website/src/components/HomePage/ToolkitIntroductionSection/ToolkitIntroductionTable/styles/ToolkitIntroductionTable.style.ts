import {CSSProperties} from "react";
import {DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../../utils/colors";

const toolkitIntroductionTableStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1000px',
  height: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'flex-start',
  position: 'relative',
  zIndex: 2
}

const smallToolkitIntroductionTableStyle: CSSProperties = {
  ...toolkitIntroductionTableStyle,
  flexDirection: 'column',
  width: '100%',
  maxWidth: '588px',
  height: 'max-content',
  marginTop: '-20px',
  alignItems: 'center'
}

const toolkitIntroductionTableColumnStyle: CSSProperties = {
  width: 'calc(33% - 11% - 2px)',
  maxWidth: '280px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'space-evenly',
  textAlign: 'center'
}

const smallToolkitIntroductionTableColumnStyle: CSSProperties = {
  ...toolkitIntroductionTableColumnStyle,
  width: '100%',
  height: 'auto',
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
  width: '100%',
}

const subtitleStyle: CSSProperties = {
  width: '100%',
  maxWidth: '278px',
  fontSize: '17px',
  lineHeight: '28px',
  color: DEFAULT_TEXT,
  margin: 0
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  width: '100%',
  margin: '0 0 30px 0',
}

const separatorLineStyle: CSSProperties = {
  height: 'auto',
  width: '2px',
  objectFit: 'contain',
  margin: '0 4.5%'
}

export const styles = {
  ToolkitIntroductionTable: (isSmall: boolean) => {
    return isSmall ? smallToolkitIntroductionTableStyle : toolkitIntroductionTableStyle;
  },
  ToolkitIntroductionTableColumn: (isSmall: boolean) => isSmall ? smallToolkitIntroductionTableColumnStyle : toolkitIntroductionTableColumnStyle,
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