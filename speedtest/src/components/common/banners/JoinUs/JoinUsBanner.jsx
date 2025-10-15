import styles from './join_us_banner.module.css';
import arrowRightBlue from '../../../../assets/right-arrow-blue.png';
import { useTranslation } from 'react-i18next';

const JoinUsBanner = ({openModal}) => {
  const { t } = useTranslation();

  return (
    <button className={styles.banner} onClick={openModal}>
      {t('banners.joinUs.text')}
      <span className={styles.link}>{t('banners.joinUs.link')}</span>
      <img className={styles.arrowIcon} src={arrowRightBlue} width={14} height={14} alt={t('alt.icons.blueArrowRight')}/>
    </button>
  );
};

export default JoinUsBanner;