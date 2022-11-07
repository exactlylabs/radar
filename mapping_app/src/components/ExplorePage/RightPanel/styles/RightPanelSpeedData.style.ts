import {CSSProperties} from "react";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";
import {FOOTER_TEXT} from "../../../../styles/colors";

const rightPanelSpeedDataContainerStyle: CSSProperties = {
  width: '100%',
  height: '50px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '30px auto 25px 0',
}

const smallRightPanelSpeedDataContainerStyle: CSSProperties = {
  ...rightPanelSpeedDataContainerStyle,
  width: 'max-content',
  justifyContent: 'flex-start',
  height: '70px',
}

const iconStyle: CSSProperties = {
  width: '20px',
  minWidth: '20px',
  height: '20px',
  minHeight: '20px',
  marginRight: '8px',
  color: FOOTER_TEXT,
}

export const styles = {
  RightPanelSpeedDataContainer: (isSmall: boolean) => {
    return isSmall ? smallRightPanelSpeedDataContainerStyle : rightPanelSpeedDataContainerStyle;
  },
  Icon: (speedState?: string) => {
    if(speedState) {
      const color = speedColors[speedState.toUpperCase() as keyof SpeedsObject];
      return {...iconStyle, color};
    } else {
      return iconStyle;
    }
  }
}