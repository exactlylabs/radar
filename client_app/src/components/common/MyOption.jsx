import {useEffect, useState} from "react";
import './styles/MyOption.css';
import {placementOptions} from "../../utils/placements";
import {useMobile} from "../../hooks/useMobile";

const optionStyle = {
  width: 134,
  height: 107,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 20,
  cursor: 'pointer',
}

const mobileOptionStyle = {
  width: 'calc(100% - 40px)',
  height: 56,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
  cursor: 'pointer',
  paddingLeft: 20,
  paddingRight: 20,
}

const lastOptionStyle = {
  ...optionStyle,
  marginRight: 0,
}

const hoverStyle = {
  border: 'solid 1px #4b7be5',
}

const optionIconStyle = {
  marginBottom: 10,
}

const mobileOptionIconStyle = {

}

const optionTextStyle = {
  fontSize: 16,
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

  const isMobile = useMobile();

  useEffect(() => {
    if(isCurrentOption()) {
      pickOption();
    }
  }, [selectedOption]);

  const isCurrentOption = () => selectedOption?.id === index;

  const pickOption = () => {
    const allOptions = document.getElementsByClassName('my-option');
    let previouslyPickedOption;
    for(let i = 0 ; i < allOptions.length ; i++) {
      const currentElem = allOptions[i];
      if(currentElem.classList.contains('picked'))
        previouslyPickedOption = currentElem;
    }
    if(previouslyPickedOption) previouslyPickedOption.classList.remove('picked');
    const currentOption = document.getElementById(`option-${index}`);
    currentOption.classList.add('picked');
    setSelectedOption(index);
  }

  return isMobile ?
    <div style={mobileOptionStyle}
         className={'my-option'}
         onClick={pickOption}
         id={`option-${index}`}
    >
      <div style={optionTextStyle}>{option.text}</div>
      <img src={isCurrentOption() ? option.iconSelectedSrc : option.iconSrc} width={28} height={28} style={mobileOptionIconStyle} alt={`${option.text}-icon`}/>
    </div>
    :
    <div style={isLast ? lastOptionStyle : optionStyle}
         className={'my-option'}
         onClick={pickOption}
         id={`option-${index}`}
    >
      <img src={isCurrentOption() ? option.iconSelectedSrc : option.iconSrc} width={32} height={32} style={optionIconStyle} alt={`${option.text}-icon`}/>
      <div style={optionTextStyle}>{option.text}</div>
    </div>

}

export default MyOption;