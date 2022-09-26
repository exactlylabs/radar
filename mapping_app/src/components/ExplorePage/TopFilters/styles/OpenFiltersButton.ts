import {CSSProperties} from "react";

const openFiltersButtonContainerStyle: CSSProperties = {
  width: '130px',
  height: '48px',
}

const iconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  marginRight: '5px'
}

export const styles = {
  OpenFiltersButtonContainer: () => {
    return openFiltersButtonContainerStyle;
  },
  Icon: () => {
    return iconStyle;
  }
}