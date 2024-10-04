import styles from './recent_test_tooltip.module.css';

export default function RecentTestTooltip() {
  return (
    <div className={styles.tooltip}>
      <h5 className={styles.title}>Your results were added to the map.</h5>
      <p className={styles.subtitle}>Click on a dot to view more details.</p>
    </div>
  )
}