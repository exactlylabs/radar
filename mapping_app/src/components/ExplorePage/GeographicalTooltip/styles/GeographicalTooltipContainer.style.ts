import {CSSProperties} from "react";
import {
  DEFAULT_SECONDARY_BUTTON,
  DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT,
  EXPLORATION_POPOVER_SECONDARY_BLACK, FOOTER_TEXT
} from "../../../../styles/colors";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";
import {SignalStates} from "../../../../utils/types";

const geographicalTooltipContainerStyle: CSSProperties = {
  width: '300px',
  height: '200px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  borderRadius: '10px',
  boxShadow: `0 2px 10px -4px ${EXPLORATION_POPOVER_SECONDARY_BLACK}`,
  position: 'absolute',
  left: '40%',
  top: '40%',
  zIndex: 1000,
}

const geographicalTooltipContentWrapperStyle: CSSProperties = {
  width: '276px',
  height: '173px',
  margin: '17px auto 10px',
  position: 'relative'
}

const headerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginBottom: '10px',
}

const textContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  marginBottom: '7px',
}

const mainTextStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
}

const secondaryTextStyle: CSSProperties = {
  fontSize: '18px',
  color: DEFAULT_TEXT,
}

const signalStateContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const signalStateIndicatorStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginRight: '6px',
}

const signalStateStyle: CSSProperties = {
  fontSize: '13px',
  color: DEFAULT_SECONDARY_TEXT
}

const speedDataContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const iconStyle: CSSProperties = {
  width: '15px',
  marginRight: '8px',
  color: FOOTER_TEXT,
}

const arrowStyle: CSSProperties = {
  width: '20px',
}

const buttonContainerStyle: CSSProperties = {
  width: '100%',
  position: 'absolute',
  bottom: 0,
}

export const styles = {
  GeographicalTooltipContainer: () => {
    return geographicalTooltipContainerStyle;
  },
  GeographicalTooltipContentWrapper: () => {
    return geographicalTooltipContentWrapperStyle;
  },
  Header: () => {
    return headerStyle;
  },
  TextContainer: () => {
    return textContainerStyle;
  },
  MainText: () => {
    return mainTextStyle;
  },
  SecondaryText: () => {
    return secondaryTextStyle;
  },
  SignalStateContainer: () => {
    return signalStateContainerStyle;
  },
  SignalStateIndicator: (signalState: SignalStates) => {
    const backgroundColor = speedColors[signalState.toUpperCase() as keyof SpeedsObject];
    return {...signalStateIndicatorStyle, backgroundColor};
  },
  SignalStateText: () => {
    return signalStateStyle;
  },
  SpeedDataContainer: () => {
    return speedDataContainerStyle;
  },
  Icon: (signalState?: SignalStates) => {
    if(signalState) {
      const color = speedColors[signalState.toUpperCase() as keyof SpeedsObject];
      return {...iconStyle, color};
    } else {
      return iconStyle;
    }
  },
  ButtonContainer: () => {
    return buttonContainerStyle;
  },
  Arrow: (color: string) => {
    return {...arrowStyle, color};
  }
}
