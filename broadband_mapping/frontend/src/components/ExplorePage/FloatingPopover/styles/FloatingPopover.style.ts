import {CSSProperties} from "react";
import {
  CLOSE_PANEL_BUTTON_SHADOW_RGBA,
  DEFAULT_SECONDARY_BUTTON,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT, FOOTER_TEXT
} from "../../../../styles/colors";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";
import L from "leaflet";

const floatingPopoverStyle: CSSProperties = {
  width: '296px',
  height: '214px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  zIndex: 2000,
  position: 'absolute',
  overflow: 'hidden hidden',
  borderRadius: '10px',
  padding: '18px',
}

const headerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginBottom: '15px',
}

const textContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  marginBottom: '0px',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
}

const mainTextStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
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
  marginTop: '5px',
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
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const iconStyle: CSSProperties = {
  width: '20px',
  marginRight: '6px',
  color: FOOTER_TEXT,
}

const arrowStyle: CSSProperties = {
  width: '20px',
}

const buttonContainerStyle: CSSProperties = {
  width: '100%',
  marginTop: '25px'
}

const whiteArrowStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  margin: '0 0 0 5px'
}

const closeIconStyle: CSSProperties = {
  width: '26px',
  height: '26px',
  position: 'absolute',
  right: '15px',
  top: '15px',
  cursor: 'pointer',
  zIndex: 1100
}

export const styles = {
  FloatingPopover: (point: L.Point) => {
    return {...floatingPopoverStyle, left: point.x, top: point.y};
  },
  Header: headerStyle,
  TextContainer: textContainerStyle,
  MainText: mainTextStyle,
  SecondaryText: secondaryTextStyle,
  SignalStateContainer: signalStateContainerStyle,
  SignalStateIndicator: (signalState: string) => {
    const backgroundColor = speedColors[signalState.toUpperCase() as keyof SpeedsObject];
    return {...signalStateIndicatorStyle, backgroundColor};
  },
  SignalStateText: signalStateStyle,
  SpeedDataContainer: speedDataContainerStyle,
  Icon: (signalState?: string) => {
    if(signalState) {
      const color = speedColors[signalState.toUpperCase() as keyof SpeedsObject];
      return {...iconStyle, color};
    } else {
      return iconStyle;
    }
  },
  ButtonContainer: buttonContainerStyle,
  Arrow: (color: string) => {
    return {...arrowStyle, color};
  },
  WhiteArrowRight: whiteArrowStyle,
  CloseIcon: closeIconStyle,
}