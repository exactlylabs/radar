import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, GET_STARTED_BUTTON_BG} from "../../../../../../../../utils/colors";

const toolkitTabContentRowStyle: CSSProperties = {
  width: 'calc(100% - 65px)',
  height: 'max-content',
  marginLeft: '10px',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: '30px',
  cursor: 'pointer'
}

const smallToolkitTabContentRowStyle: CSSProperties = {
  ...toolkitTabContentRowStyle,
  width: 'calc(100% - 10px)',
  alignItems: 'center',
  marginTop: '20px',
}

const iconContainerStyle: CSSProperties = {
  width: '36px',
  height: '36px',
  minWidth: '36px',
  minHeight: '36px',
  borderRadius: '50%',
  backgroundColor: GET_STARTED_BUTTON_BG,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '15px',
  marginTop: '3px'
}

const textContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
}

const titleStyle: CSSProperties = {
  color: DEFAULT_TEXT,
  fontSize: '16px',
  margin: 0
}

const subtitleStyle: CSSProperties = {
  color: DEFAULT_SECONDARY_TEXT,
  fontSize: '15px',
  lineHeight: '22px',
  letterSpacing: '-0.2px',
  margin: 0
}

const titleWithIconContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

export const styles = {
  ToolkitTabContentRow: (isSmall: boolean, isFirst?: boolean) => {
    let style = isSmall ? smallToolkitTabContentRowStyle : toolkitTabContentRowStyle;
    if(isFirst) style = {...style, marginTop: '25px'};
    return style;
  },
  IconContainer: iconContainerStyle,
  TextContainer: textContainerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  TitleWithIconContainer: titleWithIconContainerStyle,
}