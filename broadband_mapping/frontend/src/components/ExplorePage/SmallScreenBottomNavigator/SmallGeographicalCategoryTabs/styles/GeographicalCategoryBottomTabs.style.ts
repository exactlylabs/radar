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
  paddingRight: '4px',
}

const rightGeographicalCategoryBottomTabsContainerStyle: CSSProperties = {
  ...geographicalCategoryBottomTabsContainerStyle,
  position: 'absolute',
  left: 'calc(100vw - 420px - 40px)',
  top: '5px'
}

const rightGeographicalCategoryBottomTabsContainerWithOpenPanelStyle: CSSProperties = {
  ...geographicalCategoryBottomTabsContainerStyle,
  width: '90%',
  position: 'absolute',
  left: 'calc(100vw - 420px - 40px - 455px)',
  top: '5px'
}

const tabContainerStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT,
  padding: '6px 25px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
}

const selectedTabContainerStyle: CSSProperties = {
  ...tabContainerStyle,
  color: BLACK,
  backgroundColor: SELECTED_TABS,
  borderRadius: '6px',
}

export const styles = {
  GeographicalCategoryBottomTabsContainer: (isSmallTabletScreen: boolean, floatRight: boolean, isRightPanelOpen: boolean, isRightPanelHidden: boolean) => {
    let style = isSmallTabletScreen ? {maxWidth: '365px'} : {};
    if(floatRight) {
      return isRightPanelOpen && !isRightPanelHidden ? {...rightGeographicalCategoryBottomTabsContainerWithOpenPanelStyle, ...style} : {...rightGeographicalCategoryBottomTabsContainerStyle, ...style};
    } else {
      return {...geographicalCategoryBottomTabsContainerStyle, ...style};
    }
  },
  TabContainer: (selected: boolean, width: string) => {
    let style = selected ? selectedTabContainerStyle : tabContainerStyle;
    return {...style, width};
  },
}