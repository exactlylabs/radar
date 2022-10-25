import {ChangeEventHandler, ReactElement, useRef} from "react";
import {styles} from "./styles/MyOptionsDropdownSearchbar.style";
import Option from "./Option";
import {Filter} from "../../../utils/types";
import SearchIcon from '../../../assets/search-icon.png';
import MySpinner from "../../common/MySpinner";
import {FOOTER_TEXT} from "../../../styles/colors";
import ClearInputButton from "../../common/ClearInputButton";

interface MyOptionsDropdownSearchbarProps {
  onChange?: ChangeEventHandler;
  stickyOption?: Filter;
  stickyOptionSelected?: boolean;
  stickyOptionOnSelect?: (option: Filter) => void;
  loading: boolean;
  clearSearch?: () => void;
}

const MyOptionsDropdownSearchbar = ({
  onChange,
  stickyOption,
  stickyOptionSelected,
  stickyOptionOnSelect,
  loading,
  clearSearch
}: MyOptionsDropdownSearchbarProps): ReactElement => {

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if(inputRef.current) inputRef.current.value = '';
    clearSearch && clearSearch();
  }

  return (
    <div style={styles.MyOptionsDropdownSearchbarContainer} id={'options-dropdown-searchbar--container'}>
      <div style={styles.SearchbarContainer}>
        <img src={SearchIcon} style={styles.SearchIcon} alt={'search-icon'}/>
        <input style={styles.Input}
               className={'fw-light'}
               onChange={onChange}
               placeholder={`Search...`}
               id={'providers-input'}
               ref={inputRef}
        />
        { !loading && !inputRef.current?.value && <div style={styles.EmptySpace}></div> }
        { loading && <MySpinner style={{width: '18px'}} color={FOOTER_TEXT}/> }
        { !loading && !!inputRef.current?.value && <ClearInputButton onClick={handleClear}/> }
      </div>
      {
        stickyOption !== undefined &&
        stickyOptionSelected !== undefined &&
        stickyOptionOnSelect !== undefined &&
        <Option option={stickyOption} selected={stickyOptionSelected} onClick={stickyOptionOnSelect}/>
      }
      <div style={styles.HorizontalDivider}/>
      <p className={'fw-regular'} style={styles.Title}>Suggestions</p>
    </div>
  )
}

export default MyOptionsDropdownSearchbar;