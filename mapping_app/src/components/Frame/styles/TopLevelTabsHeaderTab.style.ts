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

export const styles = {
  TopLevelTabsHeaderTab: (selected: boolean) => {
    return selected ? selectedTopLevelTabsHeaderTabStyle : topLevelTabsHeaderTabStyle;
  },
  HorizontalSelectedUnderline: (selected: boolean) => {
    return selected ? horizontalSelectedUnderlineStyle : emptyHorizontalSelectedUnderlineStyle;
  }
}