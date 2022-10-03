import {CSSProperties} from "react";

const mapContainerStyle: CSSProperties = {
  height: '100%',
  minHeight: '700px',
}

const spinnerContainerStyle: CSSProperties = {
  height: '100%',
  minHeight: '700px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

export const styles = {
  MapContainer: () => {
    return mapContainerStyle;
  },
  SpinnerContainer: () => {
    return spinnerContainerStyle;
  }
}