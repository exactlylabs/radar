import {CSSProperties} from "react";
import {DEFAULT_GRAY_TEXT, DEFAULT_GREEN, DEFAULT_TEXT, TRANSPARENT} from "../../../styles/colors";

const topLevelTabsHeaderTabStyle: CSSProperties = {
  height: '100%',
  width: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  fontSize: '17px',
  color: DEFAULT_GRAY_TEXT,
  marginRight: '50px',
  cursor: 'pointer',
}

const selectedTopLevelTabsHeaderTabStyle: CSSProperties = {
  ...topLevelTabsHeaderTabStyle,
  color: DEFAULT_TEXT,
}

const horizontalSelectedUnderlineStyle: CSSProperties = {
  width: '100%',
  height: '2px',
  backgroundColor: DEFAULT_GREEN,
  position: 'absolute',
  bottom: '-1px',
}

const emptyHorizontalSelectedUnderlineStyle: CSSProperties = {
  ...horizontalSelectedUnderlineStyle,
  backgroundColor: TRANSPARENT,
}

const smallTabsHeaderTab: CSSProperties = {
  height: '31px',
  margin: '0 auto',
  justifyContent: 'space-between',
}

export const styles = {
  TopLevelTabsHeaderTab: (selected: boolean, isSmall: boolean) => {
    let style = selected ? selectedTopLevelTabsHeaderTabStyle : topLevelTabsHeaderTabStyle;
    return isSmall ? {...style, ...smallTabsHeaderTab} : style;
  },
  HorizontalSelectedUnderline: (selected: boolean) => {
    return selected ? horizontalSelectedUnderlineStyle : emptyHorizontalSelectedUnderlineStyle;
  }
}