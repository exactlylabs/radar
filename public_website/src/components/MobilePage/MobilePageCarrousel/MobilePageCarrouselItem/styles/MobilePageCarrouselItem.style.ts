import {CSSProperties} from "react";
import {
  CARROUSEL_ITEM,
  CARROUSEL_ITEM_BORDER,
  CARROUSEL_ITEM_BOX_SHADOW, DEFAULT_PRIMARY_BUTTON, DEFAULT_TEXT, ITEM_ICON_CONTAINER_BLUE,
  TRANSPARENT
} from "../../../../../utils/colors";

const mobilePageCarrouselItemStyle: CSSProperties = {
  width: '100%',
  maxWidth: '340px',
  height: 'max-content',
  padding: '20px',
  borderRadius: '8px',
  border: `solid 1px ${CARROUSEL_ITEM_BORDER}`,
  backgroundColor: TRANSPARENT,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
  marginBottom: '40px',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer'
}

const selectedMobilePageCarrouselItemStyle: CSSProperties = {
  ...mobilePageCarrouselItemStyle,
  backgroundColor: CARROUSEL_ITEM,
  boxShadow: `0 4px 30px -2px ${CARROUSEL_ITEM_BOX_SHADOW}`,
}

const iconContainerStyle: CSSProperties = {
  width: '54px',
  height: '54px',
  minWidth: '54px',
  minHeight: '54px',
  maxWidth: '54px',
  maxHeight: '54px',
  backgroundColor: ITEM_ICON_CONTAINER_BLUE,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '10px',
  borderRadius: '50%'
}

const titleStyle: CSSProperties = {
  fontSize: '18px',
  lineHeight: '26px',
  margin: '0 0 7px 0',
  color: DEFAULT_TEXT
}

const subtitleStyle: CSSProperties = {
  fontSize: '16px',
  lineHeight: '28px',
  margin: 0,
  color: DEFAULT_TEXT
}

const loadingBarStyle: CSSProperties = {
  height: '3px',
  position: 'absolute',
  left: 0,
  bottom: 0,
  backgroundColor: DEFAULT_PRIMARY_BUTTON
}

export const styles = {
  MobilePageCarrouselItem: (selected: boolean) => selected ? selectedMobilePageCarrouselItemStyle : mobilePageCarrouselItemStyle,
  IconContainer: iconContainerStyle,
  Title: titleStyle,
  Subtitle: subtitleStyle,
  LoadingBar: (progress: number) => {
    return {...loadingBarStyle, width: `${progress}%`}
  }
}