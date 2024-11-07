import {useContext, useEffect, useState} from "react";
import calendarIcon from "../../../../assets/calendar-icon.svg";
import dropdownStyles from "./common/filter_dropdown.module.css";
import checkIcon from "../../../../assets/check-icon.svg";
import FilterDropdownWithSearch from "./common/FilterDropdownWithSearch";
import FiltersContext from "../../../../context/FiltersContext";

export default function InternetProviderFilter() {
  const allProvidersOption = {
    label: 'All providers',
    value: 'all_providers',
    default: true
  }

  const { visibleIspList } = useContext(FiltersContext);
  const [currentFilter, setCurrentFilter] = useState(allProvidersOption);
  const [allProvidersVisible, setAllProvidersVisible] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState([]);


  useEffect(() => {
    setFilteredOptions(getAllIspOptions());
  }, [visibleIspList]);

  const getAllIspOptions = () => {
    let options = [];
    for(const [key, value] of visibleIspList) {
      options.push({
        label: key,
        value: key,
        default: false
      })
    }
    return options;
  }

  const handleInputChange = (event) => {
    const value = event.target.value;
    if(value === '') {
      setFilteredOptions(getAllIspOptions());
      setAllProvidersVisible(true);
    } else {
      const filteredOptions = getAllIspOptions().filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredOptions(filteredOptions);
      setAllProvidersVisible(false);
    }
  }

  return (
    <FilterDropdownWithSearch
      label={currentFilter.label}
      iconSrc={calendarIcon}
      options={getAllIspOptions()}
      handleOnChange={handleInputChange}
    >
      {
        allProvidersVisible &&
        <>
          <button className={dropdownStyles.option}
                  data-selected={'all_providers' === currentFilter.value}
                  onClick={() => setCurrentFilter(allProvidersOption)}
          >
            <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
            All providers
          </button>
          <div className={dropdownStyles.divider}></div>
        </>
      }
      {filteredOptions.map(option => (
        <button className={dropdownStyles.option}
                data-selected={option.value === currentFilter.value}
                onClick={() => setCurrentFilter(option)}
                key={option.value}
        >
          <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
          <div className={dropdownStyles.multiRowLabelContainer} data-selected={option.value === currentFilter.value}>
            <p className={dropdownStyles.optionLabel}>{option.label}</p>
            {option.subLabel && <p className={dropdownStyles.optionSubLabel}>{option.subLabel}</p>}
          </div>
        </button>
      ))}
      {filteredOptions.length === 0 && <p className={dropdownStyles.emptyText}>No providers found.</p>}
    </FilterDropdownWithSearch>
  );
}