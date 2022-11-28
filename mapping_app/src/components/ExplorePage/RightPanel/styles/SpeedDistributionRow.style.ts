import {CSSProperties} from "react";
import {BLACK, DEFAULT_SECONDARY_TEXT, FILTER_SQUARE_BORDER, WHITE} from "../../../../styles/colors";

const speedDistributionRowContainerStyle: CSSProperties = {
  width: '100%',
  margin: '12px auto 12px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative'
}

const smallSpeedDistributionRowContainerStyle: CSSProperties = {
  ...speedDistributionRowContainerStyle,
  margin: '8px auto',
  alignItems: 'flex-start'
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

const smallSpeedTagStyle: CSSProperties = {
  fontSize: '13px',
  color: DEFAULT_SECONDARY_TEXT
}

const peopleCountStyle: CSSProperties = {
  fontSize: '16px',
  color: BLACK,
  marginRight: '60px',
  marginLeft: 'auto'
}

const smallPeopleCountStyle: CSSProperties = {
  ...peopleCountStyle,
  marginRight: '0',
  marginLeft: '0'
}

const percentageStyle: CSSProperties = {
  fontSize: '16px',
  color: BLACK,
  position: 'absolute',
  right: 0
}

const samplesContainerStyle: CSSProperties = {
  width: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  marginRight: '70px',
  marginLeft: 'auto',
}

const peopleCountLabelStyle: CSSProperties = {
  fontSize: '13px',
  color: DEFAULT_SECONDARY_TEXT,
}

export const styles = {
  SpeedDistributionRowContainer: (isSmall: boolean) => {
    return isSmall ? smallSpeedDistributionRowContainerStyle : speedDistributionRowContainerStyle
  },
  SpeedDistributionRowIcon: (backgroundColor: string) => {
    const boxShadow = `0 2px 8px -2px ${backgroundColor}`;
    const border = `solid 1px ${FILTER_SQUARE_BORDER}`;
    return {
      ...speedDistributionRowIconStyle,
      boxShadow,
      border,
      backgroundColor,
    };
  },
  SpeedText: speedTextStyle,
  SpeedTag: (isSmall: boolean) => {
    return isSmall ? smallSpeedTagStyle : speedTagStyle;
  },
  PeopleCount: (isSmall: boolean) => {
    return isSmall ? smallPeopleCountStyle : peopleCountStyle;
  },
  Percentage: percentageStyle,
  SamplesContainer: samplesContainerStyle,
  PeopleCountLabel: peopleCountLabelStyle,
}