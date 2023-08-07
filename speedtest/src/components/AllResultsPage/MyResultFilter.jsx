import {
  DEFAULT_FILTER_BULLET_OUTLINE_COLOR,
  DEFAULT_FILTERS_SUBTITLE_COLOR,
  TRANSPARENT,
  WHITE
} from "../../utils/colors";
import {Check} from "@mui/icons-material";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const resultFilterStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: 15,
  marginTop: 15,
  cursor: 'pointer'
}

const opaqueResultFilterStyle = {
  ...resultFilterStyle,
  opacity: 0.7,
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

const checkIconSX = {
  fontSize: 14,
  color: WHITE
}

const stateStyle = {
  fontSize: 14,
  color: DEFAULT_FILTERS_SUBTITLE_COLOR,
  marginLeft: 3,
}

const MyResultFilter = ({
  color,
  range,
  selected,
  onClick,
  state,
  opaque,
  filterTextWidth
}) => {

  const {isExtraSmallSizeScreen} = useViewportSizes();

  const getRangeText = () => {
    if(range[1] === Number.MAX_VALUE) {
      return `> ${range[0]} Mbps`;
    }
    return `${range[0]} - ${range[1]} Mbps`;
  }

  const getRowStyle = () => {
    let style = opaque ? opaqueResultFilterStyle : resultFilterStyle;
    if(isExtraSmallSizeScreen) style = {...style, marginBottom: 5};
    return style;
  }

  return (
    <div style={getRowStyle()} onClick={onClick}>
      <div style={filterBulletWrapperStyle}>
        <div style={{...filterBulletStyle, backgroundColor: color}}>
          {selected && <Check sx={checkIconSX}/>}
        </div>
      </div>
      {range && <div className={selected ? 'speedtest--bold' : ''} style={{...filterTextStyle, width: filterTextWidth}}>{getRangeText()}</div>}
      {(!isExtraSmallSizeScreen || !range) && <div style={stateStyle}>{state}</div>}
    </div>
  )
}

export default MyResultFilter;