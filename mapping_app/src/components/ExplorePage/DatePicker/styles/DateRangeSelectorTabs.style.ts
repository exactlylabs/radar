import {CSSProperties} from "react";
import {BLACK, DATE_PICKER, DEFAULT_SECONDARY_TEXT, SELECTED_TAB, TRANSPARENT} from "../../../../styles/colors";

const dateRangeSelectorTabsStyle: CSSProperties = {
  width: '100%',
  height: '48px',
  borderTopLeftRadius: '6px',
  borderTopRightRadius: '6px',
  backgroundColor: DATE_PICKER,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
}

const tabStyle: CSSProperties = {
  width: 'max-content',
  height: '38px',
  backgroundColor: TRANSPARENT,
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  paddingLeft: '12px',
  paddingRight: '12px',
  borderRadius: '6px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const selectedTabStyle: CSSProperties = {
  ...tabStyle,
  backgroundColor: SELECTED_TAB,
  color: BLACK,
}

export const styles = {
  DateRangeSelectorTabs: dateRangeSelectorTabsStyle,
  Tab: (selected: boolean) => {
    return selected ? selectedTabStyle : tabStyle;
  },
}