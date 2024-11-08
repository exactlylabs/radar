import styles from './classification_filter.module.css';
import {useContext, useEffect, useState} from "react";
import checkboxStyle from './common/checkbox.module.css';
import FiltersContext, {CLASSIFICATIONS, SPEED_RANGE, VIEW_BY} from "../../../../context/FiltersContext";
import {capitalize} from "../../../../utils/messages";

const COLORS = ['gray', 'red', 'yellow', 'green'];
const DOWNLOAD_LABELS = {
  'no-internet': 'No Internet',
  'low': '0-25 Mbps',
  'mid': '25-100 Mbps',
  'high': '100+ Mbps',
}
const UPLOAD_LABELS = {
  'no-internet': 'No Internet',
  'low': '0-3 Mbps',
  'mid': '3-20 Mbps',
  'high': '20+ Mbps',
}

export default function ClassificationFilter() {

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
      return key.split('-').map(s => capitalize(s.replace(/-/g, ' '))).join(' ');
    } else if(viewBy === VIEW_BY.DOWNLOAD) {
      return DOWNLOAD_LABELS[key];
    } else {
      return UPLOAD_LABELS[key];
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