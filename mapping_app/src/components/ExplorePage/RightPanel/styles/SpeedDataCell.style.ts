import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../styles/colors";

const speedDataCellContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const speedDataCellHeaderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: '5px'
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
  marginLeft: '23px',
}

const unitStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_TEXT
}

export const styles = {
  SpeedDataCellContainer: () => {
    return speedDataCellContainerStyle;
  },
  SpeedDataCellHeader: () => {
    return speedDataCellHeaderStyle;
  },
  Text: () => {
    return textStyle;
  },
  ValueContainer: () => {
    return valueContainerStyle;
  },
  Value: () => {
    return valueStyle;
  },
  Unit: () => {
    return unitStyle;
  }
}