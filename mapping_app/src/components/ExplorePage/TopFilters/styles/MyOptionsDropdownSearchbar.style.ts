import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, FOOTER_TEXT, LOW_OPACITY_DIVIDER, VERTICAL_DIVIDER} from "../../../../styles/colors";

const myOptionsDropdownSearchbarContainerStyle: CSSProperties = {
  width: '100%',
  marginTop: '10px',
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
}

const titleStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
  marginBottom: '-5px',
  marginLeft: '15px',
}

const inputStyle: CSSProperties = {
  width: 'calc(100% - 17px - 18px)',
  height: '50px',
  border: 'none',
  color: FOOTER_TEXT,
  fontSize: '15px',

}

const horizontalDividerStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  marginLeft: '15px',
  marginRight: '15px',
  height: '1px',
  borderRadius: '6px',
  opacity: 0.5,
  backgroundColor: VERTICAL_DIVIDER,
  marginTop: '5px',
  marginBottom: '12px',
}

const searchIconStyle: CSSProperties = {
  width: '17px',
  height: '17px',
  marginRight: '9px'
}

const searchbarContainerStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginLeft: '15px',
  marginRight: '15px',
  borderBottom: `solid 1px ${LOW_OPACITY_DIVIDER}`,
  marginBottom: '5px'
}

const emptySpaceStyle: CSSProperties = {
  width: '18px',
}

export const styles = {
  MyOptionsDropdownSearchbarContainer: myOptionsDropdownSearchbarContainerStyle,
  Title: titleStyle,
  Input: inputStyle,
  HorizontalDivider: horizontalDividerStyle,
  SearchIcon: searchIconStyle,
  SearchbarContainer: searchbarContainerStyle,
  EmptySpace: emptySpaceStyle,
}