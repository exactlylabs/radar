import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../styles/colors";

const speedDataCellContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginRight: '20px'
}

const smallSpeedDataCellContainerStyle: CSSProperties = {
  ...speedDataCellContainerStyle,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginRight: '32px'
}

const speedDataCellHeaderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: '0'
}

const textStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT
}

const smallTextStyle: CSSProperties = {
  ...textStyle,
  marginTop: '5px',
  marginBottom: '3px'
}

const valueContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  width: '100%',
}

const valueStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
  marginLeft: '28px',
}

const smallValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: '17px',
  marginLeft: '27px',
}

const smallScreenValueStyle: CSSProperties = {
  ...valueStyle,
  marginLeft: 0,
}

const unitStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT
}

const smallUnitStyle: CSSProperties = {
  ...unitStyle,
  fontSize: '15px',
}

const horizontalStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginRight: '20px'
}

const horizontalValueStyle: CSSProperties = {
  fontSize: '17px',
  color: DEFAULT_TEXT,
  margin: '0 3px 0 0'
}

const horizontalUnitVersion: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_TEXT,
  margin: 0
}

const horizontalTextStyle: CSSProperties = {
  width: '100px',
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: 0
}

export const styles = {
  SpeedDataCellContainer: (isSmall: boolean, isHorizontal?: boolean) => {
    let style = isSmall ? smallSpeedDataCellContainerStyle : speedDataCellContainerStyle;
    if(isHorizontal) style = {...style, ...horizontalStyle};
    return style;
  },
  SpeedDataCellHeader: speedDataCellHeaderStyle,
  Text: (isSmall: boolean, horizontalVersion?: boolean) => {
    if(horizontalVersion) return horizontalTextStyle;
    return isSmall ? smallTextStyle : textStyle;
  },
  ValueContainer: valueContainerStyle,
  Value: (isSmallScreen: boolean, smallVersion?: boolean, horizontalVersion?: boolean) => {
    if(horizontalVersion) return horizontalValueStyle;
    if(isSmallScreen) return smallScreenValueStyle;
    return smallVersion ? smallValueStyle : valueStyle;
  },
  Unit: (smallVersion?: boolean, horizontalVersion?: boolean) => {
    if(horizontalVersion) return horizontalUnitVersion;
    return smallVersion ? smallUnitStyle : unitStyle;
  }
}