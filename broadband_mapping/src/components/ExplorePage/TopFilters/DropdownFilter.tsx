import React, {ChangeEventHandler, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DropdownFilter.style";
import OptionsDropdown from "./OptionsDropdown";
import {FilterTypes} from "../../../utils/filters";
import {Filter, Optional} from "../../../utils/types";
import {isAsn} from "../../../api/asns/types";
import {capitalize} from "../../../utils/strings";
import Chevron from '../../../assets/chevron.png';
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {isWeekLimits} from "../../../utils/dates";

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
  lastOptionOnClick?: () => void;
  loading: boolean;
  isLast?: boolean;
  openFloatingFilter: () => void;
  shouldFloatLeft?: boolean;
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
  lastOptionOnClick,
  loading,
  isLast,
  openFloatingFilter,
  shouldFloatLeft,
}: DropdownFilterProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen, isTabletScreen, isDesktopScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isTabletScreen;

  const [selectedOption, setSelectedOption] = useState<Filter>(selectedFilter ?? options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if(dropdownOpen && type !== openFilter) closeOptionsDropdown();
  }, [openFilter]);

  useEffect(() => {
    setSelectedOption(selectedFilter);
  }, [selectedFilter]);

  const toggleOptionsDropdown = (e: any) => {
    e.stopPropagation();
    const providerSearchbar = document.getElementById('options-dropdown-searchbar--container');
    if(providerSearchbar && providerSearchbar.contains(e.target)) return;
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
    if(isAsn(selectedOption)) return capitalize(selectedOption.organization);
    else if(!isWeekLimits(selectedOption)) return capitalize(selectedOption);
    else return selectedOption;
  }

  return (
    <div style={styles.DropdownFilterContainer(isSmall, isTabletScreen, isLast, shouldFloatLeft)}
         onClick={isSmall ? openFloatingFilter : toggleOptionsDropdown}
         id={`filter-${type}`}
    >
      <div className={'hover-opaque'} style={styles.FilterContentContainer(dropdownOpen, isSmall)}>
        <img src={iconSrc} style={styles.Icon} alt={'filter-icon'}/>
        <p className={'fw-regular hover-opaque'} style={styles.Text(textWidth)}>{getText()}</p>
        { isDesktopScreen && <img src={Chevron} style={styles.Arrow} alt={'chevron'}/> }
      </div>
      {
        dropdownOpen &&
        <OptionsDropdown options={options}
                         selectedOption={selectedOption}
                         setSelectedOption={handleSelectNewFilter}
                         dropRight={type === FilterTypes.SPEED || type === FilterTypes.CALENDAR}
                         dropLeft={type === FilterTypes.PROVIDERS}
                         withSearchbar={withSearchbar}
                         searchbarOnChange={searchbarOnChange}
                         lastOptionOnClick={lastOptionOnClick}
                         loading={loading}
                         clearSearch={clearProviderList}
        />
      }
    </div>
  )
}

export default DropdownFilter;