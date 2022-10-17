import {CSSProperties} from "react";

const speedDistributionPercentageBarIndicatorsContainerStyle: CSSProperties = {
  width: '100%',
  height: '36px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative'
}

export const styles = {
  SpeedDistributionPercentageBarIndicatorsContainer: (top?: boolean) => {
    const margin = top ? '20px auto 0' : '0 auto 25px';
    return {...speedDistributionPercentageBarIndicatorsContainerStyle, margin};
  }
}