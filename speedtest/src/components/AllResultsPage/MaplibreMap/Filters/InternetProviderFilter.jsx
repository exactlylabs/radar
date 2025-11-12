import {useContext, useEffect, useState} from "react";
import calendarIcon from "../../../../assets/calendar-icon.svg";
import dropdownStyles from "./common/filter_dropdown.module.css";
import checkIcon from "../../../../assets/check-icon.svg";
import FilterDropdownWithSearch from "./common/FilterDropdownWithSearch";
import FiltersContext, {ALL_PROVIDERS_OPTION} from "../../../../context/FiltersContext";
import { useTranslation } from 'react-i18next';

export default function InternetProviderFilter() {
  const { t } = useTranslation();

  const { visibleIspList, filters, setIsp } = useContext(FiltersContext);
  const { isp } = filters;
  const [allProvidersVisible, setAllProvidersVisible] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    setFilteredOptions(getAllIspOptions());
  }, [visibleIspList]);

  const getAllIspOptions = () => {
    let options = [];
    for(const [key, value] of visibleIspList) {
      options.push({
        label: value.label,
        value: key
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

  // Translate the label if it's the ALL_PROVIDERS_OPTION
  const displayLabel = isp.value === 'all_providers' ? t(isp.label) : isp.label;

  return (
    <FilterDropdownWithSearch
      label={displayLabel}
      iconSrc={calendarIcon}
      options={getAllIspOptions()}
      handleOnChange={handleInputChange}
    >
      {
        allProvidersVisible &&
        <>
          <button className={dropdownStyles.option}
                  data-selected={ALL_PROVIDERS_OPTION.value === isp.value}
                  onClick={() => setIsp({
                    ...ALL_PROVIDERS_OPTION,
                    label: ALL_PROVIDERS_OPTION.label  // Keep the translation key
                  })}
          >
            <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
            {t('map.filters.panel.allProviders')}
          </button>
          <div className={dropdownStyles.divider}></div>
        </>
      }
      {filteredOptions.map(option => (
        <button className={dropdownStyles.option}
                data-selected={option.value === isp.value}
                onClick={() => setIsp(option)}
                key={option.value}
        >
          <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
          <div className={dropdownStyles.multiRowLabelContainer} data-selected={option.value === isp.value}>
            <p className={dropdownStyles.optionLabel}>{option.label}</p>
            {option.subLabel && <p className={dropdownStyles.optionSubLabel}>{option.subLabel}</p>}
          </div>
        </button>
      ))}
      {filteredOptions.length === 0 && <p className={dropdownStyles.emptyText}>{t('map.filters.panel.noProvidersFound')}</p>}
    </FilterDropdownWithSearch>
  );
}