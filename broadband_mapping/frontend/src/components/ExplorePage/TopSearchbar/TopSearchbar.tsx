import {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import './styles/TopSearchbar.css';
import {debounce} from "../../../api/utils/debouncer";
import {handleError} from "../../../api";
import {Optional} from "../../../utils/types";
import {getGeospaces} from "../../../api/geospaces/requests";
import {DetailedGeospace, GeospaceSearchResult} from "../../../api/geospaces/types";
import SmallScreenSearchbar from "./SmallScreenSearchbar/SmallScreenSearchbar";
import RegularSearchbar from "./RegularSearchbar/RegularSearchbar";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface TopSearchbarProps {
  selectSuggestion: (suggestion: DetailedGeospace) => void;
  toggleFilters: () => void;
  areSmallFiltersOpen: boolean;
}

const TopSearchbar = ({
  selectSuggestion,
  areSmallFiltersOpen,
  toggleFilters
}: TopSearchbarProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen} = useViewportSizes();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<DetailedGeospace>>([]);

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

  useEffect(() => {
    if(open && areSmallFiltersOpen) toggleFilters();
  }, [open]);

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

  const clearInput = () => {
    if(inputRef.current) inputRef.current.value = '';
  }

  return isSmallScreen || isSmallTabletScreen ?
    <SmallScreenSearchbar inputRef={inputRef}
                          handleInputChange={handleInputChange}
                          loading={loading}
                          suggestions={suggestions}
                          selectSuggestion={selectSuggestion}
                          open={open}
                          setOpen={setOpen}
                          toggleFilters={toggleFilters}
                          areSmallFiltersOpen={areSmallFiltersOpen}
                          clearInput={clearInput}
    /> :
    <RegularSearchbar inputRef={inputRef}
                      handleInputChange={handleInputChange}
                      loading={loading}
                      suggestions={suggestions}
                      selectSuggestion={selectSuggestion}
                      open={open}
                      setOpen={setOpen}
                      clearInput={clearInput}
    />;
}

export default TopSearchbar;