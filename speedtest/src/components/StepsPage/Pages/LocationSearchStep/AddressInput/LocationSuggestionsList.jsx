import {useEffect, useState} from "react";
import SuggestionRow from "./SuggestionRow";
import {DEFAULT_MODAL_BOX_SHADOW, WHITE} from "../../../../../utils/colors";

const invisibleStyle = {
  display: 'none',
}

const suggestionsContainerStyle = {
  width: '100%',
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
  zIndex: 10,
  boxShadow: `0 4px 15px -2px ${DEFAULT_MODAL_BOX_SHADOW}`
}

const emptySuggestionStyle = {
  width: '95%',
  height: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: 20
}

const scrollableContainerStyle = {
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}

const LocationSuggestionsList = ({
  suggestions,
  autofillInput,
  open,
  setOpen,
  currentInputValue
}) => {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const clickOutsideContainerFunction = e => {
    const suggestionsListContainerElement = document.getElementById('speedtest--address-input-wrapper');
    if (!suggestionsListContainerElement?.contains(e.target)) {
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
    setOpen(true);
    setSelectedIndex(0);
  }, [suggestions]);

  return (
    <div id={'speedtest--suggestions-list-container'} style={open ? suggestionsContainerStyle : invisibleStyle}>
      <div style={scrollableContainerStyle}>
        {
          !!suggestions &&
          suggestions.map((suggestion, index) => (
            <SuggestionRow key={index}
                           suggestion={suggestion}
                           index={index}
                           selected={selectedIndex === index}
                           setSelected={setSelectedIndex}
                           autofillInput={autofillInput}
                           setOpen={setOpen}
            />
          ))
        }
        { !!currentInputValue &&
          <SuggestionRow key={'current-input-value'}
                         suggestion={{address: currentInputValue}}
                         index={-1}
                         selected={suggestions?.length === 0 || selectedIndex === -1}
                         setSelected={setSelectedIndex}
                         setOpen={setOpen}
          />
        }
      </div>
    </div>
  )
}

export default LocationSuggestionsList;