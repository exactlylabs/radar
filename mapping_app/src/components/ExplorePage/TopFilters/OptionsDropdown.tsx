import {ReactElement, useEffect} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';
import {Filter} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";

interface OptionsDropdownProps {
  options: Array<Filter>;
  closeDropdown: () => void;
  selectedOption: Filter,
  setSelectedOption: (option: Filter) => void;
  dropLeft: boolean;
  dropRight: boolean;
}

const OptionsDropdown = ({
  options,
  closeDropdown,
  selectedOption,
  setSelectedOption,
  dropLeft,
  dropRight
}: OptionsDropdownProps): ReactElement => {

  const handleSelectOption = (option: Filter) => setSelectedOption(option);

  return (
    <div style={styles.OptionsDropdownContainer(dropLeft, dropRight)}>
      {
        options.map(option => (
          <Option key={isAsn(option) ? option.id : option}
                  option={option}
                  selected={option === selectedOption}
                  onClick={handleSelectOption}
          />
        ))
      }
    </div>
  )
}

export default OptionsDropdown;