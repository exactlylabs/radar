import {ChangeEventHandler, ReactElement, RefObject} from "react";
import {styles} from "../styles/TopSearchbar.style";
import SearchIcon from "../../../../assets/search-icon.png";
import MySpinner from "../../../common/MySpinner";
import {WHITE} from "../../../../styles/colors";
import ArrowRight from "../../../../assets/arrow-right.png";
import SuggestionsBox from "../SuggestionsBox";
import {Geospace} from "../../../../api/geospaces/types";
import ClearIcon from '../../../../assets/clear-button.png';

interface RegularSearchbarProps {
  inputRef: RefObject<HTMLInputElement>;
  handleInputChange: ChangeEventHandler;
  loading: boolean;
  suggestions: Array<Geospace>;
  selectSuggestion: (suggestion: Geospace) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  clearInput: () => void;
}

const RegularSearchbar = ({
  inputRef,
  handleInputChange,
  loading,
  suggestions,
  selectSuggestion,
  open,
  setOpen,
  clearInput
}: RegularSearchbarProps): ReactElement => {
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
      { inputRef && inputRef.current?.value &&
        <img className={'hover-opaque'} src={ClearIcon} style={styles.ClearIcon} alt={'clear-icon'} onClick={clearInput}/>
      }
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

export default RegularSearchbar;
