import {CSSProperties} from "react";
import {DEFAULT_BUTTON_BOX_SHADOW_RGBA, DEFAULT_SECONDARY_BUTTON,} from "../../../../styles/colors";

const dropdownFiltersContainerStyle: CSSProperties = {
  width: 'max-content',
  height: '48px',
  borderRadius: '6px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  boxShadow: `0 2px 10px -4px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '10px',
  marginLeft: '10px',
}

const iconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  marginRight: '5px',
}

export const styles = {
  DropdownFiltersContainer: () => {
    return dropdownFiltersContainerStyle;
  },
  Icon: () => {
    return iconStyle;
  }
}