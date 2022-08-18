import {DEFAULT_VERTICAL_DIVIDER_COLOR} from "../../utils/colors";

const verticalDividerStyle = {
  marginRight: 20,
}

const lineStyle = {
  height: 5,
  width: 1,
  backgroundColor: DEFAULT_VERTICAL_DIVIDER_COLOR,
  marginBottom: 5,
}

/**
 * Custom vertical dashed divider to position between options in option picker.
 * @returns {JSX.Element}
 */
const MyVerticalDivider = () => {

  return (
    <div style={verticalDividerStyle}>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
    </div>
  )
}

export default MyVerticalDivider;