import {ChangeEventHandler, ReactElement, useState} from "react";
import {KeyboardArrowDownRounded} from "@mui/icons-material";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {filterTypes} from "../../../utils/filters";
import {Filter, Optional} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";
import {capitalize} from "../../../utils/strings";

interface DropdownFilterProps {
  icon: ReactElement;
  options: Array<Filter>;
  withSearchbar?: boolean;
  textWidth: string;
  type: string;
  changeFilter: (filter: Filter) => void;
  selectedFilter: Filter;
  searchbarOnChange?: ChangeEventHandler;
}

const DropdownFilter = ({
  icon,
  options,
  withSearchbar,
  textWidth,
  type,
  changeFilter,
  selectedFilter,
  searchbarOnChange
}: DropdownFilterProps): ReactElement => {
  const [selectedOption, setSelectedOption] = useState<Filter>(selectedFilter ?? options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleOptionsDropdown = (e: any) => {
    const optionElement: Optional<HTMLElement> = document.getElementById(`filter-${type}`);
    if(optionElement && optionElement === e.target) {
      if (dropdownOpen) closeOptionsDropdown();
      else openOptionsDropdown();
    }
  }

  const openOptionsDropdown = () => setDropdownOpen(true);

  const closeOptionsDropdown = () => setDropdownOpen(false);

  const handleSelectNewFilter = (newFilter: Filter) => {
    setSelectedOption(newFilter);
    changeFilter(newFilter);
  }

  const getText = () => {
    return isAsn(selectedOption) ? capitalize(selectedOption.organization) : capitalize(selectedOption);
  }

  return (
    <div style={styles.DropdownFilterContainer}
         onClick={toggleOptionsDropdown}
    >
      {icon}
      <p className={'fw-regular hover-opaque'} style={styles.Text(textWidth)} id={`filter-${type}`}>{getText()}</p>
      <KeyboardArrowDownRounded style={styles.Arrow}/>
      {
        dropdownOpen &&
        <OptionsDropdown options={options}
                         closeDropdown={closeOptionsDropdown}
                         selectedOption={selectedOption}
                         setSelectedOption={handleSelectNewFilter}
                         dropRight={type === filterTypes.SPEED || type === filterTypes.CALENDAR}
                         dropLeft={type === filterTypes.PROVIDERS}
                         withSearchbar={withSearchbar}
                         searchbarOnChange={searchbarOnChange}
        />
      }
    </div>
  )
}

export default DropdownFilter;