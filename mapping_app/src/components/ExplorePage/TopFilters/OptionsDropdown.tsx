import {ChangeEventHandler, ReactElement} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';
import {Filter} from "../../../utils/types";
import {Asn, isAsn} from "../../../api/asns/types";
import MyOptionsDropdownSearchbar from "./MyOptionsDropdownSearchbar";
import {allProvidersElement} from "./utils/providers";

interface OptionsDropdownProps {
  options: Array<Filter>;
  closeDropdown: () => void;
  selectedOption: Filter,
  setSelectedOption: (option: Filter) => void;
  dropLeft: boolean;
  dropRight: boolean;
  withSearchbar?: boolean;
  searchbarOnChange?: ChangeEventHandler;
}

const OptionsDropdown = ({
  options,
  closeDropdown,
  selectedOption,
  setSelectedOption,
  dropLeft,
  dropRight,
  withSearchbar,
  searchbarOnChange
}: OptionsDropdownProps): ReactElement => {

  const handleSelectOption = (option: Filter) => setSelectedOption(option);

  return (
    <div style={styles.OptionsDropdownContainer(dropLeft, dropRight)}>
      {
        withSearchbar &&
        <MyOptionsDropdownSearchbar
          type={'provider'}
          stickyOption={allProvidersElement}
          stickyOptionOnSelect={setSelectedOption}
          stickyOptionSelected={allProvidersElement.id === (selectedOption as Asn).id}
          onChange={searchbarOnChange}
        />
      }
      {
        options.map(option => (
          <Option key={isAsn(option) ? option.id : option}
                  option={option}
                  selected={isAsn(option) ? (option as Asn).id === (selectedOption as Asn).id : option === selectedOption}
                  onClick={handleSelectOption}
          />
        ))
      }
    </div>
  )
}

export default OptionsDropdown;