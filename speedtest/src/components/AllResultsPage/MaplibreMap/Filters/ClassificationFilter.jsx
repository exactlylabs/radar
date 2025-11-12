import styles from './classification_filter.module.css';
import {useContext, useEffect, useState} from "react";
import checkboxStyle from './common/checkbox.module.css';
import FiltersContext, {CLASSIFICATIONS, SPEED_RANGE, VIEW_BY} from "../../../../context/FiltersContext";
import {capitalize} from "../../../../utils/messages";
import { useTranslation } from 'react-i18next';

const COLORS = ['gray', 'red', 'yellow', 'green'];

export default function ClassificationFilter() {
  const { t } = useTranslation();
  const { filters, setViewBy, setViewByFilters } = useContext(FiltersContext);
  const { viewBy, viewByFilters } = filters;

  const [viewByOptions, setViewByOptions] = useState(getViewByOptions());

  useEffect(() => {
    setViewByOptions(getViewByOptions());
  }, [viewBy]);

  // defining as function due to hoisting
  function getViewByOptions() {
    if(viewBy === VIEW_BY.CLASSIFICATION) {
      return Object.values(CLASSIFICATIONS);
    } else {
      return Object.values(SPEED_RANGE);
    }
  }

  const toggleFilter = (e) => {
    const key = e.target.id;
    if (viewByFilters.includes(key)) {
      setViewByFilters(viewByFilters.filter((item) => item !== key));
    } else {
      setViewByFilters([...viewByFilters, key]);
    }
  }

  const getLabel = (key) => {
    if(viewBy === VIEW_BY.CLASSIFICATION) {
      // Map classification keys to translation keys
      const classificationMap = {
        'no-internet': t('map.filters.classifications.noInternet'),
        'unserved': t('map.filters.classifications.unserved'),
        'underserved': t('map.filters.classifications.underserved'),
        'served': t('map.filters.classifications.served')
      };
      return classificationMap[key] || key;
    } else if(viewBy === VIEW_BY.DOWNLOAD) {
      // Map speed range keys to translation keys
      const downloadMap = {
        'no-internet': t('map.filters.speeds.download.noInternet'),
        'low': t('map.filters.speeds.download.low'),
        'mid': t('map.filters.speeds.download.mid'),
        'high': t('map.filters.speeds.download.high')
      };
      return downloadMap[key] || key;
    } else {
      // Map speed range keys to translation keys
      const uploadMap = {
        'no-internet': t('map.filters.speeds.upload.noInternet'),
        'low': t('map.filters.speeds.upload.low'),
        'mid': t('map.filters.speeds.upload.mid'),
        'high': t('map.filters.speeds.upload.high')
      };
      return uploadMap[key] || key;
    }
  }

  return (
    <div className={styles.container}>
      {viewByOptions.map((key, idx) => (
        <div key={key} className={styles.buttonContainer}>
          <div className={checkboxStyle.classificationCheckboxContainer}>
            <input id={key}
              type={'checkbox'}
              className={checkboxStyle.checkbox}
              onChange={toggleFilter}
              data-color={COLORS[idx]}
              checked={viewByFilters.includes(key)}
            />
            <label htmlFor={key} className={styles.checkboxLabel}>{getLabel(key)}</label>
          </div>
          { idx !== viewByOptions.length - 1 && <div className={styles.divider}></div> }
        </div>
      ))}
    </div>
  );
}