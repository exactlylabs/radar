import FilterButtonOn from '../../assets/filter-button-on.png';
import FilterButtonOff from '../../assets/filter-button-off.png';
import {DEFAULT_FILTER_ACTIVE_COUNT_COLOR, WHITE} from "../../utils/colors";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";
import {useViewportSizes} from "../../hooks/useViewportSizes";

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

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);

  const getFloatingButtonStyle = () => {
    const element = document.getElementById('speedtest--main-frame');
    const {x, y, width, height} = element.getBoundingClientRect();
    if(config.widgetMode) {
      return {...floatingButtonStyle, bottom: null, right: null, top: (height - 180), left: (width - 70)}
    } else if(config.webviewMode) {
      return {...floatingButtonStyle, bottom: null, right: null, top: 'calc(100vh - 48px - 25px)', left: (width - 70)}
    } else {
      if(isMediumSizeScreen || isSmallSizeScreen) return {...mobileFloatingButtonStyle, top: (height - 205)};
      return { ...floatingButtonStyle, top: (height - 380), left: width - 80 };
    }
  }

  return (
    <div className={'speedtest--bold'} style={getFloatingButtonStyle()} id={'speedtest--floating-explore-button--filters-button'} onClick={onClick}>
      <img src={isBoxOpen ? FilterButtonOn : FilterButtonOff} width={68} height={68} alt={'filters-button'}/>
      {
        activeFiltersCount > 0 && !isBoxOpen &&
        <div style={activeFiltersCountStyle}>{activeFiltersCount}</div>
      }
    </div>
  )
}

export default FloatingExploreButton;