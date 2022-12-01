import {CSSProperties} from "react";

const mapContainerStyle: CSSProperties = {
  height: '100%',
  minHeight: '700px',
}

const smallMapContainerStyle: CSSProperties = {
  height: '100%',
}

const spinnerContainerStyle: CSSProperties = {
  height: '100%',
  minHeight: '700px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

export const styles = {
  MapContainer: (isSmall: boolean) => {
    return isSmall ? smallMapContainerStyle : mapContainerStyle;
  },
  SpinnerContainer: spinnerContainerStyle
}