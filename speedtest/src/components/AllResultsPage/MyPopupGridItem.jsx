import {DEFAULT_POPUP_TITLE_COLOR, DEFAULT_POPUP_VALUE_COLOR} from "../../utils/colors";

const gridItemStyle = {
  width: 122.5,
  height: 60,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginBottom: 5
}

const gridItemTopRowStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const gridItemBottomRowStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: 4,
}

const gridItemTitleStyle = {
  fontSize: 14,
  color: DEFAULT_POPUP_TITLE_COLOR,
  marginLeft: 5,
}

const gridItemValueStyle = {
  fontSize: 18,
  color: DEFAULT_POPUP_VALUE_COLOR,
  margin: 0,
  marginRight: 4,
}

const gridItemUnitStyle = {
  fontSize: 14,
  color: DEFAULT_POPUP_VALUE_COLOR,
  margin: 0,
}

const MyPopupGridItem = ({
  icon,
  title,
  value,
  unit
}) => {

  return (
    <div style={gridItemStyle}>
      <div style={gridItemTopRowStyle}>
        <img src={icon} width={16} height={16} alt={`${title}-icon`}/>
        <div className={'speedtest--bold'} style={gridItemTitleStyle}>{title}</div>
      </div>
      <div style={gridItemBottomRowStyle}>
        <p className={'speedtest--p speedtest--bold'} style={gridItemValueStyle}>{value}</p>
        <p className={'speedtest--p'} style={gridItemUnitStyle}>{unit}</p>
      </div>
    </div>
  )
}

export default MyPopupGridItem;