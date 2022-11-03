import {ChangeEventHandler, ReactElement, RefObject} from "react";
import SearchIcon from "../../../../assets/search-icon.png";
import SuggestionsBox from "../SuggestionsBox";
import {Geospace} from "../../../../api/geospaces/types";
import {styles} from "./styles/SmallScreenSearchbar.style";
import VerticalSearchbarDivider from "./VerticalSearchbarDivider/VerticalSearchbarDivider";
import FiltersIcon from '../../../../assets/show-filters.png';

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
  areSmallFiltersOpen
}: SmallScreenSearchbarProps): ReactElement => {
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
      <VerticalSearchbarDivider/>
      <div className={'hover-opaque'} style={styles.FiltersButton(areSmallFiltersOpen)} onClick={toggleFilters}>
        <img src={FiltersIcon} style={styles.FiltersIcon} alt={'filters-icon'}/>
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

export default SmallScreenSearchbar;