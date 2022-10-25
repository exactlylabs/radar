import {CSSProperties} from "react";
import {WHITE} from "../../../../styles/colors";

const speedDistributionPercentageBarWrapperStyle: CSSProperties = {
  width: '100%',
  height: '40px',
  position: 'relative'
}

const speedDistributionPercentageBarContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  overflow: 'hidden',
}

const fragmentStyle: CSSProperties = {
  height: '100%',
  color: WHITE,
  fontSize: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export const styles = {
  SpeedDistributionPercentageBarContainer: speedDistributionPercentageBarContainerStyle,
  Fragment: (width: string, backgroundColor: string) => {
    const boxShadow = `0 6px 15px -8px ${backgroundColor}`;
    return {...fragmentStyle, width, backgroundColor, boxShadow};
  },
  SpeedDistributionPercentageBarWrapper: speedDistributionPercentageBarWrapperStyle,
}