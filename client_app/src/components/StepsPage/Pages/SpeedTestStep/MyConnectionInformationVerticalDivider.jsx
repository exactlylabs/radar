import {DEFAULT_CONNECTION_INFORMATION_VERTICAL_DIVIDER_COLOR} from "../../../../utils/colors";

const dividerStyle = {
  width: 1,
  height: 23,
  backgroundColor: DEFAULT_CONNECTION_INFORMATION_VERTICAL_DIVIDER_COLOR,
  margin: '0 18px',
}

const MyConnectionInformationVerticalDivider = ({
  disabled
}) => {

  return (
    <div style={dividerStyle}>

    </div>
  )
}

export default MyConnectionInformationVerticalDivider;