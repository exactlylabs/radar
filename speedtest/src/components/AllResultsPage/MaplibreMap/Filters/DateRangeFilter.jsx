import {useState} from "react";
import dropdownStyles from '../Filters/common/filter_dropdown.module.css';
import FilterDropdown from "./common/FilterDropdown";
import calendarIcon from '../../../../assets/calendar-icon.svg';
import checkIcon from '../../../../assets/check-icon.svg';

export default function DateRangeFilter({openCalendarModal}) {

  const options = [
    {label: 'Last 6 months', value: 'last_6_months', default: true},
    {label: 'This year', value: 'this_year', default: false},
    {label: 'Last year', value: 'last_year', default: false},
  ];

  const [currentFilter, setCurrentFilter] = useState(options.find(option => option.default));

  return (
    <FilterDropdown label={currentFilter.label} iconSrc={calendarIcon}>
      {options.map(option => (
        <button className={dropdownStyles.option}
                data-selected={option.value === currentFilter.value}
                onClick={() => setCurrentFilter(option)}
                key={option.value}
        >
          <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
          {option.label}
        </button>
      ))}
      <div className={dropdownStyles.divider}></div>
      <button className={dropdownStyles.option}
              onClick={openCalendarModal}
      >
        Custom dates
      </button>
    </FilterDropdown>
  )
}