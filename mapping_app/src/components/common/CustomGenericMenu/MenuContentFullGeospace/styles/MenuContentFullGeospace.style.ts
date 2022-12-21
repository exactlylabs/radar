import {CSSProperties} from "react";

const menuFullGeospaceContentContainerStyle: CSSProperties = {
  width: '100%',
  maxHeight: 'calc(100vh - 58px - 40px)'
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
  justifyContent: 'center',
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
  MenuFullGeospaceContentContainer: menuFullGeospaceContentContainerStyle,
  GradientUnderlay: gradientUnderlayStyle,
  MenuContentWrapper: menuContentWrapperStyle,
  DropdownFiltersContainer: dropdownFiltersContainerStyle,
  SpeedDataScrollableContainer: (isIphone: boolean) => {
    let style = speedDataScrollableContainerStyle;
    if(isIphone) style = {...style, height: 'calc(100% - 58px - 40px - 50px - 90px)'};
    return style;
  },

}