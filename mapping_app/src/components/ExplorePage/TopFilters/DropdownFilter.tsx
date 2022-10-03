import {ReactElement, useState} from "react";
import {KeyboardArrowDownRounded} from "@mui/icons-material";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {filterTypes} from "../../../utils/filters";
import {Filter} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";

interface DropdownFilterProps {
  icon: ReactElement;
  options: Array<Filter>;
  withSearchbar?: boolean;
  textWidth: string;
  type: string;
  changeFilter: (filter: Filter) => void;
  selectedFilter: Filter;
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
  const [selectedOption, setSelectedOption] = useState<Filter>(selectedFilter ?? options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleOptionsDropdown = () => {
    if(dropdownOpen) closeOptionsDropdown();
    else openOptionsDropdown();
  }

  const openOptionsDropdown = () => setDropdownOpen(true);

  const closeOptionsDropdown = () => setDropdownOpen(false);

  const handleSelectNewFilter = (newFilter: Filter) => {
    setSelectedOption(newFilter);
    changeFilter(newFilter);
  }

  const getText = () => {
    return isAsn(selectedOption) ? selectedOption.organization : selectedOption;
  }

  return (
    <div style={styles.DropdownFilterContainer()}
         onClick={toggleOptionsDropdown}
    >
      {icon}
      <p className={'fw-regular hover-opaque'} style={styles.Text(textWidth)}>{getText()}</p>
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