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

  return (
    <div style={styles.SuggestionsBoxContainer} id={'suggestions-box'}>
      {
        suggestions.map((suggestion, index) =>
          <Suggestion suggestion={suggestion}
                      key={index}
                      selectSuggestion={handleSelectSuggestion}
                      isLast={index === (suggestions.length - 1)}
          />)
      }
    </div>
  )
}

export default SuggestionsBox;