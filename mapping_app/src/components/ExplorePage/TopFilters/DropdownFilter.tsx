import React, {ChangeEventHandler, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {filterTypes} from "../../../utils/filters";
import {Filter, Optional} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";
import {capitalize} from "../../../utils/strings";
import Chevron from '../../../assets/chevron.png';
import Option from "./Option";

interface DropdownFilterProps {
  iconSrc: string;
  options: Array<Filter>;
  withSearchbar?: boolean;
  textWidth: string;
  type: string;
  changeFilter: (filter: Filter) => void;
  selectedFilter: Filter;
  searchbarOnChange?: ChangeEventHandler;
  clearProviderList?: () => void;
  openFilter: Optional<string>;
  setOpenFilter: (newFilter: Optional<string>) => void;
}

const DropdownFilter = ({
  iconSrc,
  options,
  withSearchbar,
  textWidth,
  type,
  changeFilter,
  selectedFilter,
  searchbarOnChange,
  clearProviderList,
  openFilter,
  setOpenFilter,
}: DropdownFilterProps): ReactElement => {

  const [selectedOption, setSelectedOption] = useState<Filter>(selectedFilter ?? options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if(dropdownOpen && type !== openFilter) closeOptionsDropdown();
  }, [openFilter]);

  const toggleOptionsDropdown = (e: any) => {
    e.stopPropagation();
    if (dropdownOpen) {
      closeOptionsDropdown();
      setOpenFilter(null);
    } else {
      setOpenFilter(type);
      openOptionsDropdown();
    }
  }

  const openOptionsDropdown = () => setDropdownOpen(true);

  const closeOptionsDropdown = () => setDropdownOpen(false);

  const handleSelectNewFilter = (newFilter: Filter) => {
    setSelectedOption(newFilter);
    changeFilter(newFilter);
    setDropdownOpen(false);
    if(isAsn(newFilter) && clearProviderList) clearProviderList();
  }

  const getText = () => {
    return isAsn(selectedOption) ? capitalize(selectedOption.organization) : capitalize(selectedOption);
  }

  return (
    <div style={styles.DropdownFilterContainer}
         onClick={toggleOptionsDropdown}
         id={`filter-${type}`}
    >
      <div className={'hover-opaque'} style={styles.FilterContentContainer(dropdownOpen)}>
        <img src={iconSrc} style={styles.Icon} alt={'filter-icon'}/>
        <p className={'fw-regular hover-opaque'} style={styles.Text(textWidth)}>{getText()}</p>
        <img src={Chevron} style={styles.Arrow} alt={'chevron'}/>
      </div>
      {
        dropdownOpen &&
        <OptionsDropdown options={options}
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