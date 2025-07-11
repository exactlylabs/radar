import {CSSProperties} from "react";
import {DEFAULT_TEXT, GENERIC_MENU} from "../../../../../styles/colors";

const modalContentYearOrMonthStyle: CSSProperties = {
  width: '350px',
  marginTop: '35px',
}

const goBackIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  position: 'absolute',
  top: '18px',
  left: '20px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  color: DEFAULT_TEXT,
  marginBottom: '20px',
}

const itemsContainerStyle: CSSProperties = {
  width: '100%',
  minHeight: '150px',
  maxHeight: '400px',
  backgroundColor: GENERIC_MENU,
  borderRadius: '6px',
  marginBottom: '30px',
  overflowY: 'auto',
  overflowX: 'hidden',
}

const scrollableContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}

export const styles = {
  ModalContentYearOrMonth: modalContentYearOrMonthStyle,
  GoBackIcon: goBackIconStyle,
  Title: titleStyle,
  ItemsContainer: itemsContainerStyle,
  ScrollableContainer: scrollableContainerStyle,
}