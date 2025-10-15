import styles from './submitted_info_banner.module.css';
import greenCheck from '../../../../assets/green-check.png';
import { useTranslation } from 'react-i18next';

const SubmittedInfoBanner = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.banner}>
      <div className={styles.checkContainer}>
        <img src={greenCheck} width={16} height={16} alt={t('alt.icons.greenCheck')}/>
      </div>
      {t('banners.submitted.text')}
    </div>
  );
};

export default SubmittedInfoBanner;