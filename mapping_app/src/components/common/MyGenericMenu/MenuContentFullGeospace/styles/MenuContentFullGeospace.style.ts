import {CSSProperties} from "react";

const menuFullGeospaceContentContainerStyle: CSSProperties = {
  width: '100%',
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
}

const dropdownFiltersContainerStyle: CSSProperties = {
  width: '100%',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '22px',
  marginBottom: '30px'
}

export const styles = {
  MenuFullGeospaceContentContainer: menuFullGeospaceContentContainerStyle,
  GradientUnderlay: gradientUnderlayStyle,
  MenuContentWrapper: menuContentWrapperStyle,
  DropdownFiltersContainer: dropdownFiltersContainerStyle,

}