import {CSSProperties} from "react";
import {EXPLORATION_POPOVER_SECONDARY_BLACK, RIGHT_PANEL} from "../../../../styles/colors";

const rightPanelContainerStyle: CSSProperties = {
  width: '520px',
  height: '100%',
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 1002,
  boxShadow: `0 2px 4px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
}

const hiddenRightPanelContainerStyle: CSSProperties = {
  ...rightPanelContainerStyle,
  width: '25px',
}

const rightPanelContentContainerStyle: CSSProperties = {
  width: '496px',
  height: '100%',
  backgroundColor: RIGHT_PANEL,
  position: 'absolute',
  top: 0,
  right: 0,
}

const rightPanelContentWrapperStyle: CSSProperties = {
  width: '446px',
  margin: '0 auto',
}

const dropdownFiltersContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const gradientUnderlayStyle: CSSProperties = {
  width: '100%',
  height: '210px',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundImage: 'linear-gradient(to bottom, #f5f5f5, transparent)',
  zIndex: 1001,
}

export const styles = {
  RightPanelContainer: (isHidden: boolean) => {
    return isHidden ? hiddenRightPanelContainerStyle : rightPanelContainerStyle;
  },
  RightPanelContentContainer: rightPanelContentContainerStyle,
  RightPanelContentWrapper: rightPanelContentWrapperStyle,
  DropdownFiltersContainer: dropdownFiltersContainerStyle,
  GradientUnderlay: gradientUnderlayStyle,
}