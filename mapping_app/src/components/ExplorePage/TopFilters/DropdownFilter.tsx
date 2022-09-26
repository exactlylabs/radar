import {ReactElement, useState} from "react";
import {KeyboardArrowDownRounded} from "@mui/icons-material";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {filterTypes} from "./DropdownFilters";

interface DropdownFilterProps {
  icon: ReactElement;
  options: Array<string>;
  withSearchbar?: boolean;
  textWidth: string,
  type: string,
}

const DropdownFilter = ({
  icon,
  options,
  withSearchbar,
  textWidth,
  type
}: DropdownFilterProps): ReactElement => {

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleOptionsDropdown = () => {
    if(dropdownOpen) closeOptionsDropdown();
    else openOptionsDropdown();
  }

  const openOptionsDropdown = () => setDropdownOpen(true);

  const closeOptionsDropdown = () => setDropdownOpen(false);

  return (
    <div style={styles.DropdownFilterContainer()}
         onClick={toggleOptionsDropdown}
    >
      {icon}
      <p className={'fw-regular hover-opaque'} style={styles.Text(textWidth)}>{selectedOption}</p>
      <KeyboardArrowDownRounded style={styles.Arrow()}/>
      {
        dropdownOpen &&
        <OptionsDropdown options={options}
                         closeDropdown={closeOptionsDropdown}
                         selectedOption={selectedOption}
                         setSelectedOption={setSelectedOption}
                         dropRight={type === filterTypes.SPEED || type === filterTypes.CALENDAR}
                         dropLeft={type === filterTypes.PROVIDERS}
        />
      }
    </div>
  )
}

export default DropdownFilter;