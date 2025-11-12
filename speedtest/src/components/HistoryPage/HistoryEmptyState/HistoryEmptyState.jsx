import styles from './history_empty_state.module.css';
import initialHeroIcon from "../../../assets/initial-page-hero-icon.png";
import {MyForwardButton} from "../../common/MyForwardButton";
import { useTranslation } from 'react-i18next';

const HistoryEmptyState = ({goToTest}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img className={styles.image} src={initialHeroIcon} alt={t('alt.icons.initialHero')} width={188} height={78}/>
      <h2 className={styles.title}>{t('history.empty.title')}</h2>
      <p className={styles.subtitle}>{t('history.empty.subtitle')}</p>
      <div className={styles.buttonContainer}>
        <MyForwardButton text={t('history.empty.button')} onClick={goToTest}/>
      </div>
    </div>
  );
};

export default HistoryEmptyState;