import {DEFAULT_VERTICAL_OPTION_DIVIDER_COLOR} from "../../utils/colors";

const horizontalOptionDividerStyle = {
  width: '90%',
  height: 1,
  borderTop: `dashed 1px ${DEFAULT_VERTICAL_OPTION_DIVIDER_COLOR}`,
  marginBottom: 15,
  marginTop: 5,
}

const MyHorizontalOptionDivider = () => <div style={horizontalOptionDividerStyle}></div>;

export default MyHorizontalOptionDivider;