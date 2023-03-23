import './SuggestionRow.css';
import {useEffect} from "react";
import {DEFAULT_TEXT_COLOR} from "../../../../../utils/colors";
import LocationIcon from '../../../../../assets/location-icon.png';
import BlueArrow from '../../../../../assets/icons-arrow-right-blue.png';

const suggestionRowStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: 45,
  fontSize: 15,
  cursor: 'pointer',
  overflowX: 'hidden',
  color: DEFAULT_TEXT_COLOR
}

const locationIconStyle = {
  width: '32px',
  height: '32px',
  minWidth: '32px',
  minHeight: '32px',
  maxWidth: '32px',
  maxHeight: '32px',
  marginLeft: '12px',
  marginRight: '10px'
}

const suggestionTextStyle = {
  maxWidth: '75%',
  width: 'max-content',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const rightArrowStyle = {
  width: '14px',
  height: '14px',
  minWidth: '14px',
  minHeight: '14px',
  maxWidth: '14px',
  maxHeight: '14px',
  marginRight: '16px',
  marginLeft: 'auto'
}

const SuggestionRow = ({
  index,
  suggestion,
  selected,
  setSelected,
  autofillInput,
  setOpen
}) => {

  useEffect(() => {
    if(suggestion) {
      // always set first element as 'selected'
      const firstElement = document.getElementById('speedtest--row-0');
      if(firstElement) firstElement.classList.add('speedtest--selected');
      else document.getElementById('speedtest--row--1').classList.add('speedtest--selected');
    }
  }, [suggestion]);

  useEffect(() => {
    if(!selected) unsetHovered();
  }, [selected]);

  const setHovered = () => {
    setSelected && setSelected(index);
    const thisRow = document.getElementById(`speedtest--row-${index}`);
    const hoveredElements = document.getElementsByClassName('speedtest--selected');
    if(hoveredElements.length > 0) {
      const currentElementHovered = hoveredElements[0]; // should only be one
      currentElementHovered.classList.remove('speedtest--selected');
    }
    thisRow.classList.add('speedtest--selected');
  }

  const unsetHovered = () => {
    const thisRow = document.getElementById(`speedtest--row-${index}`);
    thisRow.classList.remove('speedtest--selected');
  }

  const autofillInputAndCloseSuggestions = () => {
    if(index >= 0) {
      autofillInput(index, suggestion);
    }
    setOpen(false);
  }

  return (
    <div style={suggestionRowStyle}
         id={`speedtest--row-${index}`}
         className={`speedtest--suggestion-row ${selected ? 'speedtest--suggestion-row--selected' : ''}`}
         onMouseOver={setHovered}
         onMouseLeave={unsetHovered}
         onClick={autofillInputAndCloseSuggestions}
    >
      <img src={LocationIcon} width={11} height={15} alt={'Location-icon'} style={locationIconStyle}/>
      <div style={suggestionTextStyle} id={`speedtest--row-${index}-text`}>{suggestion.address}</div>
      <img src={BlueArrow} alt={'right arrow'} style={rightArrowStyle}/>
    </div>
  );
}

export default SuggestionRow;