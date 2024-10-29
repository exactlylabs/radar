import styles from './classification_filter.module.css';
import { useState } from "react";
import checkboxStyle from './common/checkbox.module.css';

export default function ConnectionTypeFilter() {

  // TODO: have a filter context object shared across the app
  // this is just for testing toggling and styles at first
  const [activeFilters, setActiveFilters] = useState([]);

  const filters = ['No Internet', 'Unserved', 'Underserved', 'Served'];

  const toggleFilter = (key) => {
    if (activeFilters.includes(key)) {
      setActiveFilters(activeFilters.filter((item) => item !== key));
    } else {
      setActiveFilters([...activeFilters, key]);
    }
  }

  const calificationColor = (key) => {
    if (key === 'No Internet') {
      return 'gray';
    } else if (key === 'Unserved') {
      return 'red';
    } else if (key === 'Underserved') {
      return 'yellow';
    } else if (key === 'Served') {
      return 'green';
    }
  }

  return (
    <div className={styles.container}>
      {filters.map((key, idx) => (
        <div className={styles.buttonContainer}>
          <div className={checkboxStyle.checkboxContainer}>
            <input id={key} type={'checkbox'} className={checkboxStyle.checkbox} onChange={toggleFilter} data-color={calificationColor(key)} />
            <label htmlFor={key} className={styles.checkboxLabel}>{key}</label>
          </div>
          {
            idx !== filters.length - 1 && <div className={styles.divider}></div>
          }
        </div>
      ))}
    </div>
  );
}