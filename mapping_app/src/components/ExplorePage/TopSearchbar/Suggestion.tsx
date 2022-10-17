import {ReactElement} from "react";
import {styles} from "./styles/Suggestion.style";
import {ArrowForwardRounded, LocationOnOutlined} from "@mui/icons-material";
import {DetailedGeospace} from "../../../api/geospaces/types";

interface SuggestionProps {
  suggestion: DetailedGeospace;
  selectSuggestion: (suggestion: DetailedGeospace) => void;
  isLast: boolean;
}

const Suggestion = ({
  suggestion,
  selectSuggestion,
  isLast
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
         style={styles.SuggestionContainer(isLast)}
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