import {ReactElement, useEffect} from "react";
import {styles} from "./styles/SuggestionsBox.style";
import {Optional} from "../../../utils/types";
import Suggestion from "./Suggestion";
import {Geospace} from "../../../api/geospaces/types";

interface SuggestionsBoxProps {
  suggestions: Array<Geospace>;
  setOpen: (state: boolean) => void;
  selectSuggestion: (suggestion: Geospace) => void;
}

const SuggestionsBox = ({
  suggestions,
  setOpen,
  selectSuggestion
}: SuggestionsBoxProps): ReactElement => {

  useEffect(() => {
    window.addEventListener('click', clickOutsideBoxHandler);
    return () => {
      window.removeEventListener('click', clickOutsideBoxHandler);
    }
  }, []);

  const clickOutsideBoxHandler = (e: MouseEvent): void => {
    const boxElement: Optional<HTMLElement> = document.getElementById('suggestions-box');
    if(boxElement && !boxElement.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  const handleSelectSuggestion = (suggestion: Geospace): void => {
    setOpen(false);
    selectSuggestion(suggestion);
  }

  const getInputValue = () => {
    const input: Optional<HTMLElement> = document.getElementById('top-searchbar--input');
    if(input) return (input as HTMLInputElement).value;
    return '';
  }

  return (
    <div style={styles.SuggestionsBoxContainer} id={'suggestions-box'}>
      {
        suggestions.length > 0 &&
        suggestions.map((suggestion, index) =>
          <Suggestion suggestion={suggestion}
                      key={index}
                      index={index}
                      selectSuggestion={handleSelectSuggestion}
                      isLast={index === (suggestions.length - 1)}
          />)
      }
      {
        suggestions.length === 0 &&
        <div style={styles.NoResultsContainer}>
          <p className={'fw-light'} style={styles.NoResultsText}>No results for</p>
          <p className={'fw-medium'} style={styles.NoResultsText}>{getInputValue()}</p>
          <p className={'fw-light'} style={styles.NoResultsText}>.</p>
        </div>
      }
    </div>
  )
}

export default SuggestionsBox;