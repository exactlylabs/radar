import {CSSProperties} from "react";

const modalContentFullGeospaceStyle: CSSProperties = {
  width: '410px',
  maxHeight: 'calc(100vh - 48px - 50px)'
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

const menuContentWrapperStyle: CSSProperties = {
  width: '100%',
  margin: '0 auto',
  height: 'calc(100vh - 58px - 40px)',
  display: 'flex',
  flexDirection: 'column',
}

const dropdownFiltersContainerStyle: CSSProperties = {
  width: '100%',
  height: '50px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: '22px',
  marginBottom: '30px'
}

const speedDataScrollableContainerStyle: CSSProperties = {
  overflowY: 'auto',
  overflowX: 'hidden',
  height: 'calc(100% - 58px - 40px - 50px)'
}

export const styles = {
  ModalContentFullGeospace: modalContentFullGeospaceStyle,
  GradientUnderlay: gradientUnderlayStyle,
  MenuContentWrapper: menuContentWrapperStyle,
  DropdownFiltersContainer: dropdownFiltersContainerStyle,
  SpeedDataScrollableContainer: speedDataScrollableContainerStyle,
}