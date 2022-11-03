import {CSSProperties} from "react";
import {speedColors, SpeedsObject} from "../../../../../utils/speeds";
import {DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT, FOOTER_TEXT} from "../../../../../styles/colors";

const menuContentGeospaceStyle: CSSProperties = {

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
  marginTop: '20px',
  marginBottom: '35px',
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
  marginBottom: '15px',
}

const footerTextContainerStyle: CSSProperties = {
  width: '100%',
  textAlign: 'center'
}

const footerTextStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
}

const arrowRightStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  marginLeft: '5px',
}

export const styles = {
  MenuContentGeospace: menuContentGeospaceStyle,
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
  FooterText: footerTextStyle,
  FooterTextContainer: footerTextContainerStyle,
  ArrowRight: arrowRightStyle,
}