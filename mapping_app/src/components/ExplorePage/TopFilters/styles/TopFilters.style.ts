import {CSSProperties} from "react";

const topFiltersContainerStyle: CSSProperties = {
  width: 'max-content',
  height: '48px',
  position: 'absolute',
  top: '25px',
  right: '25px',
  zIndex: 1000,
}

const narrowTopFiltersContainerStyle: CSSProperties = {
  ...topFiltersContainerStyle,
  right: '521px',
}

export const styles = {
  TopFiltersContainer: (isRightPanelOpen: boolean) => {
    return isRightPanelOpen ? narrowTopFiltersContainerStyle : topFiltersContainerStyle;
  }
}