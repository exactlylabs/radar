import {CSSProperties} from "react";
import {
  DEFAULT_SECONDARY_BUTTON,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT,
  SEARCHBAR_BOX_SHADOW_RGBA
} from "../../../../styles/colors";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";

const rightPanelHeaderContainerStyle: CSSProperties = {
  width: '100%',
  height: '60px',
  margin: '25px auto 20px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const leftSideContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

const stateTextContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  marginBottom: '7px',
}

const stateNameStyle: CSSProperties = {
  fontSize: '26px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
}

const stateCountryStyle: CSSProperties = {
  fontSize: '18px',
  color: DEFAULT_TEXT,
}

const signalStateContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const stateSignalStateIndicatorStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginRight: '6px',
}

const stateSignalStateStyle: CSSProperties = {
  fontSize: '16px',
  color: DEFAULT_SECONDARY_TEXT
}

const closeButtonStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  backgroundColor: DEFAULT_SECONDARY_BUTTON,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: `0 2px 10px -4px ${SEARCHBAR_BOX_SHADOW_RGBA}`,
  borderRadius: '6px',
}

const closeIconStyle: CSSProperties = {
  width: '15px',

}

export const styles = {
  RightPanelHeaderContainer: () => {
    return rightPanelHeaderContainerStyle;
  },
  LeftSideContainer: () => {
    return leftSideContainerStyle;
  },
  StateTextContainer: () => {
    return stateTextContainerStyle;
  },
  StateName: () => {
    return stateNameStyle;
  },
  StateCountry: () => {
    return stateCountryStyle;
  },
  SignalStateContainer: () => {
    return signalStateContainerStyle;
  },
  StateSignalStateIndicator: (stateSignalState: string) => {
    const backgroundColor = speedColors[stateSignalState.toUpperCase() as keyof SpeedsObject];
    return {...stateSignalStateIndicatorStyle, backgroundColor};
  },
  StateSignalState: () => {
    return stateSignalStateStyle;
  },
  CloseButton: () => {
    return closeButtonStyle;
  },
  CloseIcon: () => {
    return closeIconStyle;
  }
}