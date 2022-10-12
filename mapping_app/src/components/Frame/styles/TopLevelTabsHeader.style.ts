import {CSSProperties} from "react";
import {DEFAULT_CONTEXT_DIVIDER, WHITE} from "../../../styles/colors";

const topLevelTabsHeaderContainerStyle: CSSProperties = {
  width: '100%',
  height: '80px',
  backgroundColor: WHITE,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: `solid 1px ${DEFAULT_CONTEXT_DIVIDER}`
}

const mappingLogoStyle: CSSProperties = {
  width: '240px',
  height: '33px',
  marginRight: '62px',
  marginLeft: '60px',
}

const rightSideButtonContainerStyle: CSSProperties = {
  marginRight: '60px',
  marginLeft: 'auto',
}

export const styles = {
  TopLevelTabsHeaderContainer: topLevelTabsHeaderContainerStyle,
  MappingLogo: mappingLogoStyle,
  RightSideButtonContainer: rightSideButtonContainerStyle
}