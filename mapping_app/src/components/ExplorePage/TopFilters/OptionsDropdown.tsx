import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';
import {Filter} from "../../../utils/types";
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
  lastOptionTriggersFunction?: boolean;
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
  lastOptionTriggersFunction,
  lastOptionOnClick,
  loading,
  clearSearch,
}: OptionsDropdownProps): ReactElement => {

  const handleSelectOption = (option: Filter) => setSelectedOption(option);

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
        options.map((option, index) => {
          return lastOptionTriggersFunction && lastOptionOnClick ?
            <Option key={isAsn(option) ? option.id : option}
                    option={option}
                    selected={isAsn(option) ? (option as Asn).id === (selectedOption as Asn).id : option === selectedOption}
                    onClick={index === (options.length - 1) ? lastOptionOnClick : handleSelectOption}
            /> :
            <Option key={isAsn(option) ? option.id : option}
                    option={option}
                    selected={isAsn(option) ? (option as Asn).id === (selectedOption as Asn).id : option === selectedOption}
                    onClick={handleSelectOption}
            />;
        })
      }
    </div>
  )
}

export default OptionsDropdown;