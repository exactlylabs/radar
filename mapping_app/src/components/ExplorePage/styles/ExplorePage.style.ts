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

export const styles = {
  ExplorePageContainer: (isSmall: boolean) => {
    return isSmall ? smallExplorePageContainerStyle : explorePageContainerStyle;
  }
}