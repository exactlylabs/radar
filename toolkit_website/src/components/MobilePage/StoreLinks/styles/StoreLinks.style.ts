import { CSSProperties } from "react";

const storeLinksStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '1.5rem'
}

const smallStoreLinksStyle: CSSProperties = {
  ...storeLinksStyle,
  flexDirection: 'column',
  gap: '1rem',
}

const storeIconStyle: CSSProperties = {
  height: '2.5rem',
  width: 'auto'
}

export const styles = {
  StoreLinks: (isSmall: boolean) => isSmall ? smallStoreLinksStyle : storeLinksStyle,
  StoreIcon: storeIconStyle,
};