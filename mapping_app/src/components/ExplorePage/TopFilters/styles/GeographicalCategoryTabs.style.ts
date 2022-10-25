import {CSSProperties} from "react";
import {
  BLACK,
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  DEFAULT_SECONDARY_BUTTON,
  DEFAULT_SECONDARY_TEXT,
  SELECTED_TAB,
  TRANSPARENT
} from "../../../../styles/colors";

const geographicalCategoryTabsContainerStyle: CSSProperties = {
  width: '265px',
  height: '48px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  borderRadius: '6px',
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(10px)'
}

const geographicalCategoryTabsContainerWithHiddenPanelStyle: CSSProperties = {
  ...geographicalCategoryTabsContainerStyle,
  position: 'absolute',
  right: '25px',
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
  GeographicalCategoryTabsContainer: (isRightPanelHidden: boolean) => {
    return isRightPanelHidden ? geographicalCategoryTabsContainerWithHiddenPanelStyle : geographicalCategoryTabsContainerStyle;
  },
  Tab: (selected: boolean) => {
    return selected ? selectedTabStyle : tabStyle;
  },
}