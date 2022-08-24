import {DEFAULT_FILTER_BULLET_OUTLINE_COLOR, TRANSPARENT, WHITE} from "../../utils/colors";
import {Check} from "@mui/icons-material";

const resultFilterStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: 15,
  cursor: 'pointer'
}

const filterBulletWrapperStyle = {
  width: 16,
  height: 16,
  backgroundColor: TRANSPARENT,
  borderRadius: 6,
  border: `solid 1px ${DEFAULT_FILTER_BULLET_OUTLINE_COLOR}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const filterBulletStyle = {
  width: 14,
  height: 14,
  borderRadius: 5,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const filterTextStyle = {
  color: WHITE,
  fontSize: 14,
  marginLeft: 8,
}

const selectedFilterTextStyle = {
  ...filterTextStyle,
  fontWeight: 'bolder',
}

const checkIconSX = {
  fontSize: 14,
  color: 'white'
}

const MyResultFilter = ({
  color,
  range,
  selected,
  onClick
}) => {

  const getRangeText = () => {
    if(range[1] === Number.MAX_VALUE) {
      return `> ${range[0]} Mbps`;
    }
    return `${range[0]} - ${range[1]} Mbps`;
  }

  return (
    <div style={resultFilterStyle} onClick={onClick}>
      <div style={filterBulletWrapperStyle}>
        <div style={{...filterBulletStyle, backgroundColor: color}}>
          {selected && <Check sx={checkIconSX}/>}
        </div>
      </div>
      <div style={selected ? selectedFilterTextStyle : filterTextStyle}>{getRangeText()}</div>
    </div>
  )
}

export default MyResultFilter;