import {CSSProperties} from "react";
import {WHITE} from "../../../../../../utils/colors";

const toolkitFloatingMenuStyle: CSSProperties = {
  width: '688px',
  height: '319px',
  backgroundColor: WHITE,
  borderRadius: '8px',
  boxShadow: `0 3px 10px -4px rgba(0, 0, 0, 0.4)`,
  position: 'absolute',
  top: '70px',
  left: '50%',
  marginLeft: '-344px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const squareStyle: CSSProperties = {
  width: '10px',
  height: '10px',
  transform: 'rotate(45deg)',
  position: 'absolute',
  top: '-5px',
  left: '50%',
  marginLeft: '-5px',
  backgroundColor: WHITE,
  boxShadow: `0 3px 10px -4px rgba(0, 0, 0, 0.4)`,
}

export const styles = {
  ToolkitFloatingMenu: toolkitFloatingMenuStyle,
  Square: squareStyle,
}