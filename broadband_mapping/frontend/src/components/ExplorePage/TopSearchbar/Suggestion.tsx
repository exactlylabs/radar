import {ReactElement, useEffect} from "react";
import {styles} from "./styles/Suggestion.style";
import PinIconBlack from '../../../assets/pin-icon-black.png';
import {ArrowForwardRounded} from "@mui/icons-material";
import {DetailedGeospace} from "../../../api/geospaces/types";

interface SuggestionProps {
  suggestion: DetailedGeospace;
  selectSuggestion: (suggestion: DetailedGeospace) => void;
  isLast: boolean;
  index: number;
}

const Suggestion = ({
  suggestion,
  selectSuggestion,
  isLast,
  index
}: SuggestionProps): ReactElement => {

  const handleSelectSuggestion = () => {
    selectSuggestion(suggestion);
  }

  const getSecondaryText = () => {
    let name: string = '';
    if(suggestion.parent) {
      name += `, ${suggestion.parent.name}`;
    }
    name += ', U.S.A.';
    return name;
  }

  return (
    <div key={suggestion.name}
         style={styles.SuggestionContainer(isLast)}
         className={'hover-opaque suggestion'}
         onClick={handleSelectSuggestion}
    >
      <img src={PinIconBlack} style={styles.Icon} alt={'pin-icon'}/>
      <div style={styles.TextContainer}>
        <p className={'fw-regular'} style={styles.Text}>{suggestion.name}</p>
        <p className={'fw-regular'} style={styles.SecondaryText}>{getSecondaryText()}</p>
      </div>
      <ArrowForwardRounded style={styles.Arrow}/>
    </div>
  )
}

export default Suggestion;