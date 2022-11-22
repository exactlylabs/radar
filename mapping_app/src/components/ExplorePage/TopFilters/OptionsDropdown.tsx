import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';
import {Filter, Optional} from "../../../utils/types";
import {Asn, isAsn} from "../../../api/asns/types";
import MyOptionsDropdownSearchbar from "./MyOptionsDropdownSearchbar";
import {allProvidersElement} from "./utils/providers";

interface OptionsDropdownProps {
  options: Array<Filter>;
  selectedOption: Filter,
  setSelectedOption: (option: Filter) => void;
  dropLeft: boolean;
  dropRight: boolean;
  withSearchbar?: boolean;
  searchbarOnChange?: ChangeEventHandler;
  lastOptionOnClick?: () => void;
  loading: boolean;
  clearSearch?: () => void;
}

const OptionsDropdown = ({
  options,
  selectedOption,
  setSelectedOption,
  dropLeft,
  dropRight,
  withSearchbar,
  searchbarOnChange,
  lastOptionOnClick,
  loading,
  clearSearch,
}: OptionsDropdownProps): ReactElement => {

  const handleSelectOption = (option: Filter) => setSelectedOption(option);

  const getInputValue = () => {
    const input: Optional<HTMLElement> = document.getElementById('providers-input');
    if(input) return (input as HTMLInputElement).value;
    else return '';
  }

  return (
    <div style={styles.OptionsDropdownContainer(dropLeft, dropRight)}>
      {
        withSearchbar &&
        <MyOptionsDropdownSearchbar
          stickyOption={allProvidersElement}
          stickyOptionOnSelect={setSelectedOption}
          stickyOptionSelected={allProvidersElement.id === (selectedOption as Asn).id}
          onChange={searchbarOnChange}
          loading={loading}
          clearSearch={clearSearch}
        />
      }
      {
        options.length > 0 &&
        options.map((option, index) => {
          return (
            <Option key={isAsn(option) ? option.id : option}
                    option={option}
                    selected={isAsn(option) ? (option as Asn).id === (selectedOption as Asn).id : option === selectedOption}
                    onClick={index === (options.length - 1) && !!lastOptionOnClick ? lastOptionOnClick : handleSelectOption}
                    isLast={index === (options.length - 1)}
            />
          );
        })
      }
      {
        options.length === 0 && !loading &&
        <div style={styles.NoResultsTextContainer}>
          <p className={'fw-light'} style={styles.NoResultsText}>No results for</p>
          <p className={'fw-medium'} style={styles.NoResultsText}>{getInputValue()}</p>
          <p className={'fw-light'} style={styles.NoResultsText}>.</p>
        </div>
      }
    </div>
  )
}

export default OptionsDropdown;