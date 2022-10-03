import {ReactElement, useState} from "react";
import {KeyboardArrowDownRounded} from "@mui/icons-material";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {filterTypes} from "../../../utils/filters";

interface DropdownFilterProps {
  icon: ReactElement;
  options: Array<string>;
  withSearchbar?: boolean;
  textWidth: string;
  type: string;
  changeFilter: (filter: string) => void;
  selectedFilter: string;
}

const DropdownFilter = ({
  icon,
  options,
  withSearchbar,
  textWidth,
  type,
  changeFilter,
  selectedFilter
}: DropdownFilterProps): ReactElement => {
  const [selectedOption, setSelectedOption] = useState(selectedFilter ?? options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleOptionsDropdown = () => {
    if(dropdownOpen) closeOptionsDropdown();
    else openOptionsDropdown();
  }

  const openOptionsDropdown = () => setDropdownOpen(true);

  const closeOptionsDropdown = () => setDropdownOpen(false);

  const handleSelectNewFilter = (newFilter: string) => {
    setSelectedOption(newFilter);
    changeFilter(newFilter);
  }

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
                         setSelectedOption={handleSelectNewFilter}
                         dropRight={type === filterTypes.SPEED || type === filterTypes.CALENDAR}
                         dropLeft={type === filterTypes.PROVIDERS}
        />
      }
    </div>
  )
}

export default DropdownFilter;