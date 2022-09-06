import {DEFAULT_SELECTED_FILTER_TAB_COLOR, TRANSPARENT, WHITE} from "../../utils/colors";

const filterTabStyle = {
  width: '48%',
  height: '85%',
  backgroundColor: TRANSPARENT,
  color: WHITE,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  fontSize: 13,
  cursor: 'pointer',
}

const selectedFilterTabStyle = {
  ...filterTabStyle,
  borderRadius: 20,
  backgroundColor: DEFAULT_SELECTED_FILTER_TAB_COLOR,
}

const MyFilterTab = ({
  label,
  selected,
  onClick
}) => {

  return (
    <div style={selected ? selectedFilterTabStyle : filterTabStyle}
         onClick={onClick}>
      {label}
    </div>
  )
}

export default MyFilterTab;