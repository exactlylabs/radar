import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, VERTICAL_LINE_PERCENTAGE} from "../../../../styles/colors";

const percentageBarIndicatorContainerStyle: CSSProperties = {
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
}

const textStyle: CSSProperties = {
  fontSize: '14px',
  color: DEFAULT_SECONDARY_TEXT,
  left: 0,
  position: 'absolute',
  flexWrap: 'nowrap'
}

const verticalLineStyle: CSSProperties = {
  width: '2px',
  height: '12px',
  backgroundColor: VERTICAL_LINE_PERCENTAGE,
  borderRadius: '2px',
  position: 'absolute',
}

export const styles = {
  PercentageBarIndicatorContainer: percentageBarIndicatorContainerStyle,
  Text: (left: string | number, isTop?: boolean) => {
    return isTop ? {...textStyle, left, top: 0} : {...textStyle, left, bottom: 0}
  },
  VerticalLine: (left: string | number, isTop?: boolean) => {
    return isTop ? {...verticalLineStyle, left, bottom: '6px'} : {...verticalLineStyle, left, top: '6px'};
  }
}