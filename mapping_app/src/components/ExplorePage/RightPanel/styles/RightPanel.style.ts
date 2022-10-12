import {CSSProperties} from "react";
import {EXPLORATION_POPOVER_SECONDARY_BLACK, RIGHT_PANEL} from "../../../../styles/colors";

const rightPanelContainerStyle: CSSProperties = {
  width: '520px',
  height: '100%',
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 1000,
  boxShadow: `0 2px 4px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
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
  width: '85%',
  margin: '0 auto',
}

const dropdownFiltersContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export const styles = {
  RightPanelContainer: rightPanelContainerStyle,
  RightPanelContentContainer: rightPanelContentContainerStyle,
  RightPanelContentWrapper: rightPanelContentWrapperStyle,
  DropdownFiltersContainer: dropdownFiltersContainerStyle
}