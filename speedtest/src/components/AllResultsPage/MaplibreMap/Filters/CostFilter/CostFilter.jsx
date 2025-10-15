import {useContext, useState} from "react";
import styles from './cost_filter.module.css';
import CostSlider from "./CostSlider";
import FiltersContext from "../../../../../context/FiltersContext";
import { useTranslation } from 'react-i18next';

export default function CostFilter() {
  const { t } = useTranslation();
  const { filters, setIncludeNoCost } = useContext(FiltersContext);
  const { includeNoCost } = filters;

  const handleCheckboxChange = (e) => {
    setIncludeNoCost(e.target.checked);
  }

  return (
    <div className={styles.container}>
      <CostSlider />
      <div className={styles.checkboxContainer}>
        <input id={'include-no-cost'}
          type={'checkbox'}
          className={styles.checkbox}
          onChange={handleCheckboxChange}
          checked={includeNoCost}
        />
        <label htmlFor={'include-no-cost'} className={styles.label}>{t('map.filters.panel.includeNoCost')}</label>
      </div>
    </div>
  );
}