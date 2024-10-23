import {useState} from "react";
import calendarIcon from "../../../../assets/calendar-icon.svg";
import dropdownStyles from "./common/filter_dropdown.module.css";
import checkIcon from "../../../../assets/check-icon.svg";
import FilterDropdownWithSearch from "./common/FilterDropdownWithSearch";

export default function InternetProviderFilter() {
  const allProvidersOption = {
    label: 'All providers',
    value: 'all_providers',
    default: true
  }
  // TODO: Replace this with actual data, leaving mock for now for following work
  const options = [
    {label: 'AT&T Internet Services', subLabel: '430,000 results', value: '1', default: false},
    {label: 'Bigriver', subLabel: '290,100 results', value: '2', default: false},
    {label: 'Comcast (Xfinity)', subLabel: '130,940 results', value: '3', default: false},
    {label: 'Lumen Technologies', subLabel: '90,300 results', value: '4', default: false},
  ];

  const [currentFilter, setCurrentFilter] = useState(allProvidersOption);
  const [allProvidersVisible, setAllProvidersVisible] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState(options);

  const handleInputChange = (event) => {
    const value = event.target.value;
    if(value === '') {
      setFilteredOptions(options);
      setAllProvidersVisible(true);
    } else {
      const filteredOptions = options.filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredOptions(filteredOptions);
      setAllProvidersVisible(false);
    }
  }

  return (
    <FilterDropdownWithSearch
      label={currentFilter.label}
      iconSrc={calendarIcon}
      options={options}
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