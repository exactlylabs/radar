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
  zIndex: 1002,
}

const countyRightPanelHeaderContainerStyle: CSSProperties = {
  ...rightPanelHeaderContainerStyle,
  height: '85px',
}

const leftSideContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  zIndex: 1002,
  marginLeft: '10px',
}

const smallLeftSideContainerStyle: CSSProperties = {
  ...leftSideContainerStyle,
  marginLeft: 0
}

const stateTextContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  marginBottom: '7px',
}

const countyTextContainerStyle: CSSProperties = {
  ...stateTextContainerStyle,
  flexDirection: 'column',
}

const geospaceNameStyle: CSSProperties = {
  fontSize: '26px',
  color: DEFAULT_TEXT,
  marginRight: '5px',
  maxWidth: '310px',
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const smallGeospaceNameStyle: CSSProperties = {
  ...geospaceNameStyle,
  fontSize: '22px',
}

const stateCountryStyle: CSSProperties = {
  fontSize: '18px',
  color: DEFAULT_TEXT,
}

const smallStateCountryStyle: CSSProperties = stateCountryStyle;

const parentNameStyle: CSSProperties = {
  fontSize: '18px',
  color: DEFAULT_TEXT,
  marginRight: '3px',
}

const smallParentNameStyle: CSSProperties = parentNameStyle;

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
  zIndex: 1002,
}

const closeIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  minHeight: '20px',
  minWidth: '20px'
}

const stateAndCountryStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: '7px',
}

export const styles = {
  RightPanelHeaderContainer: (isCounty: boolean, isSmall: boolean) => {
    let style = isCounty ? countyRightPanelHeaderContainerStyle : rightPanelHeaderContainerStyle;
    return isSmall ? {...style, margin: '0 auto'} : style;
  },
  LeftSideContainer: (isSmall: boolean) => {
    return isSmall ? smallLeftSideContainerStyle : leftSideContainerStyle;
  },
  StateTextContainer: (isCounty: boolean) => isCounty ? countyTextContainerStyle : stateTextContainerStyle,
  GeospaceName: (isSmall: boolean) => isSmall ? smallGeospaceNameStyle : geospaceNameStyle,
  StateCountry: (isSmall: boolean) => isSmall ? smallStateCountryStyle : stateCountryStyle,
  ParentName: (isSmall: boolean) => isSmall ? smallParentNameStyle : parentNameStyle,
  SignalStateContainer: signalStateContainerStyle,
  StateSignalStateIndicator: (stateSignalState: string) => {
    const backgroundColor = speedColors[stateSignalState.toUpperCase() as keyof SpeedsObject];
    return {...stateSignalStateIndicatorStyle, backgroundColor};
  },
  StateSignalState: stateSignalStateStyle,
  CloseButton: closeButtonStyle,
  CloseIcon: closeIconStyle,
  StateAndCountryLine: stateAndCountryStyle,
}