import {CSSProperties} from "react";

const mapContainerStyle: CSSProperties = {
  height: '100%',
  minHeight: '700px',
}

export const styles = {
  MapContainer: () => {
    return mapContainerStyle;
  }
}