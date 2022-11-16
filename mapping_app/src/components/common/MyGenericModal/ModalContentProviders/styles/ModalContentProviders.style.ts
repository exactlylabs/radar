import {CSSProperties} from "react";
import {DEFAULT_TEXT, GENERIC_MENU, WHITE} from "../../../../../styles/colors";

const modalContentProvidersStyle: CSSProperties = {
  width: '100%',
}

const modalContentProvidersContainerStyle: CSSProperties = {
  width: '100%',
  minHeight: '105px',
  maxHeight: '375px',
  backgroundColor: WHITE,
  borderRadius: '6px',
  marginBottom: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center'
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

const modalContentProvidersSearchbarContainerStyle: CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: '6px',
  backgroundColor: GENERIC_MENU,
  marginBottom: '15px',
  padding: '16px 14px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const searchbarIconStyle: CSSProperties = {
  width: '19px',
  height: '19px',
  marginRight: '12px',
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 19px - 12px)',
  height: '100%',
  border: 'none',
  fontSize: '16px',
  color: DEFAULT_TEXT
}

const scrollableContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden'
}

export const styles = {
  ModalContentProviders: modalContentProvidersStyle,
  Title: titleStyle,
  ModalContentProvidersSearchbarContainer: modalContentProvidersSearchbarContainerStyle,
  ModalContentProvidersContainer: modalContentProvidersContainerStyle,
  SearchbarIcon: searchbarIconStyle,
  Input: inputStyle,
  ScrollableContainer: scrollableContainerStyle,
}