import {ReactElement, useEffect} from "react";
import {styles} from "./styles/OptionsDropdown.style";
import Option from './Option';

interface OptionsDropdownProps {
  options: Array<string>;
  closeDropdown: () => void;
  selectedOption: string,
  setSelectedOption: (option: string) => void;
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

  const handleSelectOption = (option: string) => setSelectedOption(option);

  return (
    <div style={styles.OptionsDropdownContainer(dropLeft, dropRight)}>
      {
        options.map(option => (
          <Option key={option}
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