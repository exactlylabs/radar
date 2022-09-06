import FilterButtonOn from '../../assets/filter-button-on.png';
import FilterButtonOff from '../../assets/filter-button-off.png';
import {DEFAULT_FILTER_ACTIVE_COUNT_COLOR, WHITE} from "../../utils/colors";
import {useScreenSize} from "../../hooks/useScreenSize";

const floatingButtonStyle = {
  width: 68,
  height: 68,
  borderRadius: '50%',
  cursor: 'pointer',
  position: 'absolute',
  bottom: 180,
  right: 10,
  zIndex: 1001,
}

const mobileFloatingButtonStyle = {
  ...floatingButtonStyle,
  bottom: 15,
  right: 10,
}

const activeFiltersCountStyle = {
  width: 16,
  height: 16,
  backgroundColor: DEFAULT_FILTER_ACTIVE_COUNT_COLOR,
  color: WHITE,
  borderRadius: 6,
  position: 'absolute',
  bottom: 15,
  right: 10,
  zIndex: 1002,
  fontSize: 11,
}

const FloatingExploreButton = ({
  activeFiltersCount,
  isBoxOpen,
  onClick
}) => {

  const isMobile = useScreenSize();

  return (
    <div className={'bold'} style={isMobile ? mobileFloatingButtonStyle : floatingButtonStyle} onClick={onClick}>
      <img src={isBoxOpen ? FilterButtonOn : FilterButtonOff} width={68} height={68} alt={'filters-button'}/>
      {
        activeFiltersCount > 0 && !isBoxOpen &&
        <div style={activeFiltersCountStyle}>{activeFiltersCount}</div>
      }
    </div>
  )
}

export default FloatingExploreButton;