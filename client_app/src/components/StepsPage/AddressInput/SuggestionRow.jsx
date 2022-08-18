import LocationIcon from '../../../assets/location-icon.png';
import './SuggestionRow.css';
import {useEffect, useState} from "react";

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
}

const locationIconStyle = {
  marginLeft: 15,
  marginRight: 15
}

const suggestionTextStyle = {
  maxWidth: '87%',
  width: 'max-content',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
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
      const firstElement = document.getElementById('row-0');
      firstElement.classList.add('selected');
    }
  }, [suggestion]);

  useEffect(() => {
    if(!selected) unsetHovered();
  }, [selected]);

  const setHovered = () => {
    setSelected(index);
    const thisRow = document.getElementById(`row-${index}`);
    const hoveredElements = document.getElementsByClassName('selected');
    if(hoveredElements.length > 0) {
      const currentElementHovered = hoveredElements[0]; // should only be one
      currentElementHovered.classList.remove('selected');
    }
    thisRow.classList.add('selected');
  }

  const unsetHovered = () => {
    const thisRow = document.getElementById(`row-${index}`);
    thisRow.classList.remove('selected');
  }

  const autofillInputAndCloseSuggestions = () => {
    autofillInput(index);
    setOpen(false);
  }

  return (
    <div style={suggestionRowStyle}
         id={`row-${index}`}
         className={`suggestion-row ${selected ? 'selected' : ''}`}
         onMouseOver={setHovered}
         onMouseLeave={unsetHovered}
         onClick={autofillInputAndCloseSuggestions}
    >
      <img src={LocationIcon} width={11} height={15} alt={'Location-icon'} style={locationIconStyle}/>
      <div style={suggestionTextStyle} id={`row-${index}-text`}>{suggestion}</div>
    </div>
  );
}

export default SuggestionRow;