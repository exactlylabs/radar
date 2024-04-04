import {useContext, useEffect} from "react";
import './styles/MyOption.css';
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {DEFAULT_TEXT_COLOR} from "../../utils/colors";
import ConfigContext from "../../context/ConfigContext";

const optionStyle = {
  width: 134,
  height: 107,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  gap: '10px'
}

const widgetOptionStyle = {
    ...optionStyle,
    width: 125,
}

const mobileOptionStyle = {
  width: 'calc(100% - 40px)',
  height: 56,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '10px',
  cursor: 'pointer',
  paddingLeft: 20,
  paddingRight: 20,
}

const optionTextStyle = {
  fontSize: 16,
  color: DEFAULT_TEXT_COLOR,
  margin: 0,
}

/**
 * Custom selectable option square with icon.
 * @param option: Actual option data. {iconSrc, selectedIconSrc, text}
 * @param index: number. Actual index in options array.
 * @param isLast: boolean. Indicator to have special last-item designs applied.
 * @param selectedOption: number. Current selected option index to check current option state.
 * @param setSelectedOption: func. State setter passed down from wrapper element to choose an option.
 * @returns {JSX.Element}
 */
const MyOption = ({ option, index, isLast, selectedOption, setSelectedOption }) => {

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    if(isCurrentOption()) {
      pickOption();
    }
  }, [selectedOption]);

  const isCurrentOption = () => selectedOption?.id === index;

  const pickOption = () => {
    const allOptions = document.getElementsByClassName('speedtest--my-option');
    let previouslyPickedOption;
    for(let i = 0 ; i < allOptions.length ; i++) {
      const currentElem = allOptions[i];
      if(currentElem.classList.contains('speedtest--picked'))
        previouslyPickedOption = currentElem;
    }
    if(previouslyPickedOption) previouslyPickedOption.classList.remove('speedtest--picked');
    const currentOption = document.getElementById(`speedtest--option-${index}`);
    currentOption.classList.add('speedtest--picked');
    setSelectedOption(index);
  }

  const getOptionStyle = () => {
      if(config.widgetMode) return widgetOptionStyle;
      else if(isSmallSizeScreen || isMediumSizeScreen) return mobileOptionStyle;
      else return optionStyle;
  }

  return (
    <div style={getOptionStyle()}
         className={'speedtest--my-option'}
         onClick={pickOption}
         id={`speedtest--option-${index}`}
    >
      <img src={isCurrentOption() ? option.iconSelectedSrc : option.iconSrc}
           width={!config.widgetMode && (isMediumSizeScreen || isSmallSizeScreen) ? 28 : 32}
           height={!config.widgetMode && (isMediumSizeScreen || isSmallSizeScreen) ? 28 : 32}
           alt={`${option.text}-icon`}
      />
      <p style={optionTextStyle}>{option.text}</p>
    </div>
  )

}

export default MyOption;