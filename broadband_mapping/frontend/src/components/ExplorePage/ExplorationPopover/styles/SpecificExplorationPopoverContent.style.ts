import {CSSProperties} from "react";
import {
  DEFAULT_GREEN,
  EXPLORATION_POPOVER_GRADIENT_OVERLAY,
  FOOTER_TEXT,
  SEARCHBAR_COLOR,
  WHITE
} from "../../../../styles/colors";
import {popoverStates} from "../ExplorationPopover";

const specificExplorationPopoverContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  height: 'calc(100% - 25px)',
  margin: '25px auto 0',
  position: 'relative'
}

const contentContainerStyle: CSSProperties = {
  height: 'calc(100% - 110px)',
  width: 'calc(100% + 20px)',
  margin: '20px auto 0',
  overflowY: 'scroll',
}

const specificStateContentContainerStyle: CSSProperties = {
  ...contentContainerStyle,
  height: 'calc(100% - 150px)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
}

const arrowBackStyle: CSSProperties = {
  marginRight: '10px',
  color: DEFAULT_GREEN,
  cursor: 'pointer',
}

const titleStyle: CSSProperties = {
  fontSize: '22px',
  color: WHITE,
}

const stateSelectionTextStyle: CSSProperties = {
  fontSize: '16px',
  color: FOOTER_TEXT,
  marginTop: '20px',
}

const noResultsContainerStyle: CSSProperties = {
  height: '20px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: '20px 45px auto auto',
  fontSize: '15px',
  color: SEARCHBAR_COLOR,
}

const searchedTermStyle: CSSProperties = {
  marginLeft: '3px',
}

export const styles = {
  SpecificExplorationPopoverContentContainer: specificExplorationPopoverContentStyle,
  Header: headerStyle,
  ContentContainer: (type: string) => {
    return type === popoverStates.COUNTIES ? specificStateContentContainerStyle : contentContainerStyle;
  },
  ArrowBack: arrowBackStyle,
  Title: titleStyle,
  StateSelectionText: stateSelectionTextStyle,
  NoResultsContainer: noResultsContainerStyle,
  SearchedTerm: searchedTermStyle
}