import {ReactElement} from "react";
import {styles} from "./styles/Suggestion.style";
import {ArrowForwardRounded, LocationOnOutlined} from "@mui/icons-material";
import {Geospace} from "../../../api/geospaces/types";

interface SuggestionProps {
  suggestion: Geospace;
  selectSuggestion: (suggestion: Geospace) => void;
}

const Suggestion = ({
  suggestion,
  selectSuggestion
}: SuggestionProps): ReactElement => {

  const handleSelectSuggestion = () => {
    selectSuggestion(suggestion);
  }

  const getName = () => {
    let name: string = suggestion.name;
    if(suggestion.parent) {
      name += `, ${suggestion.parent.name}`;
    }
    name += ', U.S.A.';
    return name;
  }

  return (
    <div key={suggestion.name}
         style={styles.SuggestionContainer}
         className={'hover-opaque'}
         onClick={handleSelectSuggestion}
    >
      <LocationOnOutlined style={styles.Icon}/>
      <p className={'fw-regular'} style={styles.Text}>{getName()}</p>
      <ArrowForwardRounded style={styles.Arrow}/>
    </div>
  )
}

export default Suggestion;