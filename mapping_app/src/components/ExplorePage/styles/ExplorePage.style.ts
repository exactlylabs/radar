import {CSSProperties} from "react";

const explorePageContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
}

const smallExplorePageContainerStyle: CSSProperties = {
  width: '100%',
  height: 'calc(100vh - 48px)',
  position: 'relative',
}

const invisibleOverlayStyle: CSSProperties = {
  width: '100vw',
  height: '140px',
  position: 'absolute',
  top: 0,
  zIndex: 1002,
  backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0) 70%)'
}

const bottomInvisibleOverlayStyle: CSSProperties = {
  width: '100vw',
  height: '140px',
  position: 'absolute',
  bottom: 0,
  zIndex: 1002,
  backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0) 70%)'
}

export const styles = {
  ExplorePageContainer: (isSmall: boolean) => {
    return isSmall ? smallExplorePageContainerStyle : explorePageContainerStyle;
  },
  InvisibleOverlay: (isInBottom?: boolean) => {
    return isInBottom ? bottomInvisibleOverlayStyle : invisibleOverlayStyle;
  },
}