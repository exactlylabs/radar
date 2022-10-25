import {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import {styles} from "./styles/TopSearchbar.style";
import './styles/TopSearchbar.css';
import SearchIcon from "../../../assets/search-icon.png";
import ArrowRight from '../../../assets/arrow-right.png';
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

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<Geospace>>([]);

  useEffect(() => {
    window.removeEventListener('click', openSuggestionsIfPresent);
    window.removeEventListener('keydown', goToFirstSuggestionOnEnter);
    window.addEventListener('click', openSuggestionsIfPresent);
    window.addEventListener('keydown', goToFirstSuggestionOnEnter);
    return () => {
      window.removeEventListener('click', openSuggestionsIfPresent);
      window.removeEventListener('keydown', goToFirstSuggestionOnEnter);
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

  const goToFirstSuggestionOnEnter = (e: KeyboardEvent) => {
    if(open && !loading && suggestions.length > 0 && e.key === 'Enter') {
      selectSuggestion(suggestions[0]);
      setOpen(false);
    }
  }

  const handleInputChange = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    if(!!e.target.value) {
      setLoading(true);
      try {
        const response: GeospaceSearchResult = await getGeospaces(e.target.value, 5);
        setSuggestions(response.results);
        setOpen(true);
      } catch (e: any) {
        handleError(e);
      }
      setLoading(false);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  });

  return (
    <div style={styles.TopSearchbarContainer} id={'top-searchbar'}>
      <div style={styles.IconContainer}>
        <img src={SearchIcon} style={styles.SearchIcon} alt={'search-icon'}/>
      </div>
      <input placeholder={'State, county, city, address...'}
             className={'fw-light'}
             style={styles.Input}
             onChange={handleInputChange}
             id={'top-searchbar--input'}
             ref={inputRef}
      />
      <div className={'hover-opaque'} style={styles.ArrowContainer}>
        {
          loading ?
          <MySpinner color={WHITE} style={{}}/> :
          <img src={ArrowRight} style={styles.Arrow} alt={'arrow-right'}/>
        }
      </div>
      {
        inputRef && inputRef.current?.value && open &&
        <SuggestionsBox suggestions={suggestions}
                        setOpen={setOpen}
                        selectSuggestion={selectSuggestion}
        />
      }
    </div>
  )
}

export default TopSearchbar;