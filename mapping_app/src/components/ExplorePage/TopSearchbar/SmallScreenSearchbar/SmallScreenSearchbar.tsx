import {ChangeEventHandler, ReactElement, RefObject, useEffect, useState} from "react";
import SearchIcon from "../../../../assets/search-icon.png";
import SuggestionsBox from "../SuggestionsBox";
import {Geospace} from "../../../../api/geospaces/types";
import {styles} from "./styles/SmallScreenSearchbar.style";
import VerticalSearchbarDivider from "./VerticalSearchbarDivider/VerticalSearchbarDivider";
import FiltersIcon from '../../../../assets/show-filters.png';
import {usePrev} from "../../../../hooks/usePrev";
import ClearIcon from "../../../../assets/clear-button.png";

interface SmallScreenSearchbarProps {
  inputRef: RefObject<HTMLInputElement>;
  handleInputChange: ChangeEventHandler;
  loading: boolean;
  suggestions: Array<Geospace>;
  selectSuggestion: (suggestion: Geospace) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  toggleFilters: () => void;
  areSmallFiltersOpen: boolean;
  clearInput: () => void;
}

const SmallScreenSearchbar = ({
  inputRef,
  handleInputChange,
  loading,
  suggestions,
  selectSuggestion,
  open,
  setOpen,
  toggleFilters,
  areSmallFiltersOpen,
  clearInput
}: SmallScreenSearchbarProps): ReactElement => {

  const [width, setWidth] = useState(0);
  const [intervalId, setIntervalId] = useState<any>();
  const prevLoading = usePrev({loading});

  useEffect(() => {
    const hasChanged = !!prevLoading && prevLoading.loading !== loading;
    if(hasChanged && loading) {
      setIntervalId(setInterval(() => {
        if(width + 10 < 100) setWidth(prevWidth => prevWidth + 10)
      }, 50));
    } else if(hasChanged && !loading) {
      clearInterval(intervalId);
      setWidth(0);
    }
  }, [loading]);

  return (
    <div style={styles.SmallScreenSearchbarContainer} id={'top-searchbar'}>
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
      { inputRef && inputRef.current?.value &&
        <img className={'hover-opaque'} src={ClearIcon} style={styles.ClearIcon} alt={'clear-icon'} onClick={clearInput}/>
      }
      <VerticalSearchbarDivider/>
      <div className={'hover-opaque'} style={styles.FiltersButton(areSmallFiltersOpen)} onClick={toggleFilters}>
        <img src={FiltersIcon} style={styles.FiltersIcon} alt={'filters-icon'}/>
      </div>
      <div style={styles.Loader(width)}></div>
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

export default SmallScreenSearchbar;