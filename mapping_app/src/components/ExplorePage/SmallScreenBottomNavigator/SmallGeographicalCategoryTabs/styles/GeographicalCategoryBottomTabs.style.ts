import {CSSProperties} from "react";
import {
  BLACK,
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  DEFAULT_SECONDARY_TEXT,
  GEOGRAPHICAL_CATEGORY_BOTTOM, SELECTED_TAB, SELECTED_TABS, VERTICAL_DIVIDER
} from "../../../../../styles/colors";

const geographicalCategoryBottomTabsContainerStyle: CSSProperties = {
  width: '100%',
  height: '39px',
  borderRadius: '6px',
  backgroundColor: GEOGRAPHICAL_CATEGORY_BOTTOM,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: '4px',
  paddingRight: '4px'
}

const tabContainerStyle: CSSProperties = {
  width: 'max-content',
  textAlign: 'center',
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  padding: '6px 25px',
}

const selectedTabContainerStyle: CSSProperties = {
  ...tabContainerStyle,
  color: BLACK,
  backgroundColor: SELECTED_TABS,
  borderRadius: '6px',
}

export const styles = {
  GeographicalCategoryBottomTabsContainer: geographicalCategoryBottomTabsContainerStyle,
  TabContainer: (selected: boolean) => {
    return selected ? selectedTabContainerStyle : tabContainerStyle;
  },
}