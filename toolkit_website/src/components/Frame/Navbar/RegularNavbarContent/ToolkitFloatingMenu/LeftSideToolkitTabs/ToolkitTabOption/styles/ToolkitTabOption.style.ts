import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, TRANSPARENT, WHITE} from "../../../../../../../../utils/colors";

const toolkitTabOptionStyle: CSSProperties = {
  width: '100%',
  height: '102px',
}

const firstToolkitTabOptionStyle: CSSProperties = {
  ...toolkitTabOptionStyle,
  height: '110px',
  borderTopLeftRadius: '8px'
}

const lastToolkitTabOptionStyle: CSSProperties = {
  ...toolkitTabOptionStyle,
  height: '110px',
  borderBottomLeftRadius: '8px'
}

const titleStyle: CSSProperties = {
  fontSize: '15px',
  margin: '18px 0 3px 18px',
  color: DEFAULT_TEXT
}

const subtitleStyle: CSSProperties = {
  width: '217px',
  fontSize: '15px',
  lineHeight: '22px',
  letterSpacing: '-0.2px',
  margin: '0 0 0 18px',
  color: DEFAULT_SECONDARY_TEXT,
}

export const styles = {
  ToolkitTabOption: (isFirstTab: boolean, isLastTab: boolean, selected: boolean) => {
    let style;
    if(!isFirstTab && !isLastTab) style = toolkitTabOptionStyle;
    else if(isFirstTab) style = firstToolkitTabOptionStyle;
    else if(isLastTab) style = lastToolkitTabOptionStyle;
    return {...style, backgroundColor: selected ? WHITE : TRANSPARENT};
  },
  Title: titleStyle,
  Subtitle: subtitleStyle,
}