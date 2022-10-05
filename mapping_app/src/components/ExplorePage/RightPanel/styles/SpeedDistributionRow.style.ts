import {CSSProperties} from "react";
import {BLACK, DEFAULT_SECONDARY_TEXT, WHITE} from "../../../../styles/colors";

const speedDistributionRowContainerStyle: CSSProperties = {
  width: '100%',
  margin: '12px auto 12px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative'
}

const speedDistributionRowIconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  color: WHITE,
  borderRadius: '4px',
  marginRight: '8px',
}

const speedTextStyle: CSSProperties = {
  fontSize: '16px',
  color: BLACK,
  marginRight: '4px',
}

const speedTagStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_SECONDARY_TEXT
}

const peopleCountStyle: CSSProperties = {
  fontSize: '16px',
  color: BLACK,
  marginRight: '60px',
  marginLeft: 'auto'
}

const percentageStyle: CSSProperties = {
  fontSize: '16px',
  color: BLACK,
  position: 'absolute',
  right: 0
}

export const styles = {
  SpeedDistributionRowContainer: speedDistributionRowContainerStyle,
  SpeedDistributionRowIcon: (backgroundColor: string) => {
    const boxShadow = `0 2px 8px -2px ${backgroundColor}`;
    const border = `solid 1px ${backgroundColor}`;
    return {
      ...speedDistributionRowIconStyle,
      boxShadow,
      border,
      backgroundColor,
    };
  },
  SpeedText: speedTextStyle,
  SpeedTag: speedTagStyle,
  PeopleCount: peopleCountStyle,
  Percentage: percentageStyle
}