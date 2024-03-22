import styles from './history_empty_state.module.css';
import initialHeroIcon from "../../../assets/initial-page-hero-icon.png";
import {MyForwardButton} from "../../common/MyForwardButton";

const HistoryEmptyState = ({goToTest}) => (
  <div className={styles.container}>
    <img className={styles.image} src={initialHeroIcon} alt={'initial screen hero icon'} width={188} height={78}/>
    <h2 className={styles.title}>You haven't run a speed test yet.</h2>
    <p className={styles.subtitle}>Your speed test results will appear listed here.</p>
    <div className={styles.buttonContainer}>
      <MyForwardButton text={'Take a speed test'} onClick={goToTest}/>
    </div>
  </div>
);

export default HistoryEmptyState;