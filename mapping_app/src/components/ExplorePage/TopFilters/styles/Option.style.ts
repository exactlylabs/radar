import {CSSProperties} from "react";
import {DEFAULT_GREEN, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT} from "../../../../styles/colors";

const optionStyle: CSSProperties = {
  minWidth: '140px',
  height: '40px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: '15px',
  marginRight: '15px',
}

const iconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  color: DEFAULT_GREEN,
  marginLeft: '5px',
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  fontFamily: 'OutfitRegular',
  color: DEFAULT_SECONDARY_TEXT,
}

const selectedTextStyle: CSSProperties = {
  ...textStyle,
  fontFamily: 'OutfitMedium',
  color: DEFAULT_TEXT,
}

export const styles = {
  Option: () => {
    return optionStyle;
  },
  Icon: () => {
    return iconStyle;
  },
  Text: (selected: boolean) => {
    return selected ? selectedTextStyle : textStyle;
  }
}