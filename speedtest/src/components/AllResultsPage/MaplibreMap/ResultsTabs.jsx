import styles from './results_tabs.module.css';

export const TABS = {
    ALL_RESULTS: 'all-results',
    YOUR_RESULTS: 'your-results'
};

export function ResultsTabs({filtersPanelOpen, tabSelected, onTabChanged}) {

  return (
    <>
      {false && <div className={styles.container} data-filters-panel-open={filtersPanelOpen.toString()}>
          <button className={styles.tabContainer} onClick={onTabChanged}
                  data-selected={(tabSelected === TABS.ALL_RESULTS).toString()}>All Results
          </button>
          <button className={styles.tabContainer} onClick={onTabChanged}
                  data-selected={(tabSelected === TABS.YOUR_RESULTS).toString()}>Your Results
          </button>
          <div className={styles.pill} data-selected={tabSelected}></div>
        </div>
      }
    </>
  );
}