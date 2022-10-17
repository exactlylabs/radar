import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../styles/colors";

const speedDataCellContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginRight: '20px'
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

const unitStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT
}

const smallUnitStyle: CSSProperties = {
  ...unitStyle,
  fontSize: '15px',
}

export const styles = {
  SpeedDataCellContainer: speedDataCellContainerStyle,
  SpeedDataCellHeader: speedDataCellHeaderStyle,
  Text: textStyle,
  ValueContainer: valueContainerStyle,
  Value: (smallVersion?: boolean) => {
    return smallVersion ? smallValueStyle : valueStyle;
  },
  Unit: (smallVersion?: boolean) => {
    return smallVersion ? smallUnitStyle : unitStyle;
  }
}