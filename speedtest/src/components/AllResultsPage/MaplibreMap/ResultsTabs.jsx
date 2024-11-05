import styles from './results_tabs.module.css';

export default function ResultsTabs({tabSelected, onTabChanged}) {
    return (
        <div className={styles.container}>
            <button className={styles.tabContainer} onClick={onTabChanged} data-selected={(tabSelected === 'all-results').toString()}>All Results</button>
            <button className={styles.tabContainer} onClick={onTabChanged} data-selected={(tabSelected === 'your-results').toString()}>Your Results</button>
            <div className={styles.pill} data-selected={tabSelected}></div>
        </div>
    );
}