import {useContext, useState} from "react";
import dropdownStyles from '../Filters/common/filter_dropdown.module.css';
import FilterDropdown from "./common/FilterDropdown";
import calendarIcon from '../../../../assets/calendar-icon.svg';
import checkIcon from '../../../../assets/check-icon.svg';
import FiltersContext, {DATE_RANGE_LABELS} from "../../../../context/FiltersContext";

export default function DateRangeFilter({openCalendarModal}) {

  const { filters, setDateLabel } = useContext(FiltersContext);
  const { rangeLabel } = filters;

  const options = Object.values(DATE_RANGE_LABELS).map(l => ({label: l, value: l}));

  return (
    <FilterDropdown label={rangeLabel} iconSrc={calendarIcon}>
      { !Object.values(DATE_RANGE_LABELS).includes(rangeLabel) && (
        <div className={dropdownStyles.option} data-selected={'true'}>
          <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
          {rangeLabel}
        </div>
      )}
      {options.map(option => (
        <button className={dropdownStyles.option}
                data-selected={option.value === rangeLabel}
                onClick={() => setDateLabel(option.label)}
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