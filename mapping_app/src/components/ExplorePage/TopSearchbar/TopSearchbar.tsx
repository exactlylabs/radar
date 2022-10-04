import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/TopSearchbar.style";
import SearchIcon from "../../../assets/search-icon.png";
import {ArrowForwardRounded} from "@mui/icons-material";
import {debounce} from "../../../api/utils/debouncer";
import {handleError} from "../../../api";
import MySpinner from "../../common/MySpinner";
import {WHITE} from "../../../styles/colors";
import SuggestionsBox from "./SuggestionsBox";
import {Optional} from "../../../utils/types";
import {getGeospaces} from "../../../api/geospaces/requests";
import {Geospace, GeospaceSearchResult} from "../../../api/geospaces/types";

interface TopSearchbarProps {
  selectSuggestion: (suggestion: Geospace) => void;
}

const TopSearchbar = ({ selectSuggestion }: TopSearchbarProps): ReactElement => {

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<Geospace>>([]);

  useEffect(() => {
    window.removeEventListener('click', openSuggestionsIfPresent);
    window.addEventListener('click', openSuggestionsIfPresent);
    return () => {
      window.removeEventListener('click', openSuggestionsIfPresent);
    }
  }, [suggestions]);

  const openSuggestionsIfPresent = (e: MouseEvent): void => {
    const suggestionsListContainerElement: Optional<HTMLElement> = document.getElementById('top-searchbar');
    if(suggestionsListContainerElement &&
       suggestionsListContainerElement.contains(e.target as Node) &&
       suggestions.length > 0) {
      setOpen(true);
    }
  }

  const handleInputChange = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.value) {
      setLoading(true);
      try {
        const response: GeospaceSearchResult = await getGeospaces(e.target.value, 5);
        setSuggestions(response.results);
        setOpen(true);
      } catch (e: any) {
        handleError(e);
      }
      setLoading(false);
    }
  });

  return (
    <div style={styles.TopSearchbarContainer()} id={'top-searchbar'}>
      <div style={styles.IconContainer()}>
        <img src={SearchIcon} style={styles.SearchIcon()} alt={'search-icon'}/>
      </div>
      <input placeholder={'State, county, city, address...'}
             className={'fw-light'}
             style={styles.Input()}
             onChange={handleInputChange}
      />
      <div className={'hover-opaque'} style={styles.ArrowContainer()}>
        {
          loading ?
          <MySpinner color={WHITE} style={{}}/> :
          <ArrowForwardRounded style={styles.Arrow()}/>
        }
      </div>
      {
        suggestions.length > 0 && open &&
        <SuggestionsBox suggestions={suggestions}
                        setOpen={setOpen}
                        selectSuggestion={selectSuggestion}
        />
      }
    </div>
  )
}

export default TopSearchbar;