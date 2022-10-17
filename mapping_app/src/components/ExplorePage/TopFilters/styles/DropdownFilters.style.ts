import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, DEFAULT_SECONDARY_BUTTON,} from "../../../../styles/colors";

const dropdownFiltersContainerStyle: CSSProperties = {
  width: 'max-content',
  minWidth: '445px',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  marginRight: '10px',
  marginLeft: '10px',
  backdropFilter: 'blur(10px)',
  zIndex: 1002,
}

export const styles = {
  DropdownFiltersContainer: dropdownFiltersContainerStyle,
}