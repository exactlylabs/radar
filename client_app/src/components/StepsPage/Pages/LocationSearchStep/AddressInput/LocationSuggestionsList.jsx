import {useEffect, useState} from "react";
import SuggestionRow from "./SuggestionRow";
import {WHITE} from "../../../../../utils/colors";

const invisibleStyle = {
  display: 'none',
}

const suggestionsContainerStyle = {
  width: '80%',
  maxWidth: 390,
  alignItems: 'center',
  backgroundColor: WHITE,
  borderRadius: 16,
  margin: '10px auto',
  position: 'absolute',
  padding: 5,
  left: '50%',
  transform: 'translate(-50%, -35px)',
  maxHeight: 250,
  overflowY: 'auto',
  overflowX: 'hidden',
}

const emptySuggestionStyle = {
  width: '95%',
  height: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: 20
}

const LocationSuggestionsList = ({
  suggestions,
  autofillInput,
  open,
  setOpen
}) => {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const clickOutsideContainerFunction = e => {
    const suggestionsListContainerElement = document.getElementById('address-input-wrapper');
    if (!suggestionsListContainerElement.contains(e.target)) {
      setOpen(false);
    }
  }

  const listenForArrowKeysAndEnter = e => {
    if(e.key === 'ArrowDown') {
      setSelectedIndex(prevState => {
        return prevState + 1;
      });
    } else if(e.key === 'ArrowUp') {
      setSelectedIndex(prevState => prevState - 1);
    } else if(e.key === 'Enter') {
      setSelectedIndex(prevState => {
        autofillInput(prevState);
        return prevState;
      })
      setOpen(false);
    } else if(e.key === 'Escape') {
      setOpen(false);
    }
  }

  useEffect(() => {
    window.addEventListener('click', clickOutsideContainerFunction);
    window.addEventListener('keydown', listenForArrowKeysAndEnter);
    return () => {
      window.removeEventListener('keydown', listenForArrowKeysAndEnter);
      window.removeEventListener('click', clickOutsideContainerFunction);
    }
  }, []);

  useEffect(() => {
    if(suggestions) setOpen(true);
    setSelectedIndex(0);
  }, [suggestions]);

  return (
    <div id={'suggestions-list-container'} style={open ? suggestionsContainerStyle : invisibleStyle}>
      {
        suggestions?.length > 0 ?
          suggestions.map((suggestion, index) => (
            <SuggestionRow key={index}
                           suggestion={suggestion}
                           index={index}
                           selected={selectedIndex === index}
                           setSelected={setSelectedIndex}
                           autofillInput={autofillInput}
                           setOpen={setOpen}
            />
          )) :
          <div style={emptySuggestionStyle}>No suggestions for given address.</div>
      }
    </div>
  )
}

export default LocationSuggestionsList;