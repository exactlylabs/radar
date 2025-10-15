import {useContext, useState} from "react";
import dropdownStyles from '../Filters/common/filter_dropdown.module.css';
import FilterDropdown from "./common/FilterDropdown";
import calendarIcon from '../../../../assets/calendar-icon.svg';
import checkIcon from '../../../../assets/check-icon.svg';
import FiltersContext, {DATE_RANGE_LABELS} from "../../../../context/FiltersContext";
import { useTranslation } from 'react-i18next';

export default function DateRangeFilter({openCalendarModal}) {
  const { t } = useTranslation();
  const { filters, setDateLabel } = useContext(FiltersContext);
  const { rangeLabel } = filters;

  // Create options with translated labels
  const options = Object.entries(DATE_RANGE_LABELS).map(([key, translationKey]) => ({
    label: t(translationKey),
    value: translationKey
  }));

  // Translate the rangeLabel for display
  const displayLabel = Object.values(DATE_RANGE_LABELS).includes(rangeLabel)
    ? t(rangeLabel)
    : rangeLabel;

  return (
    <FilterDropdown label={displayLabel} iconSrc={calendarIcon}>
      { !Object.values(DATE_RANGE_LABELS).includes(rangeLabel) && (
        <div className={dropdownStyles.option} data-selected={'true'}>
          <img src={checkIcon} width={16} height={16} alt={'check icon'}/>
          {rangeLabel}
        </div>
      )}
      {options.map(option => (
        <button className={dropdownStyles.option}
                data-selected={option.value === rangeLabel}
                onClick={() => setDateLabel(option.value)}
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
        {t('map.filters.panel.customDates', 'Custom dates')}
      </button>
    </FilterDropdown>
  )
}