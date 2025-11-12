import image from "../../../assets/classifications-image.svg";
import styles from "./classifications_modal.module.css";
import sharedModalStyles from "./shared_modals.module.css";
import { useTranslation } from 'react-i18next';

export default function ClassificationsModal({closeModal}) {
  const { t } = useTranslation();

  return (
    <>
      <img src={image} alt={t('alt.icons.classificationsModal')} className={sharedModalStyles.mainImage}/>
      <h5 className={sharedModalStyles.header}>{t('map.classifications.modal.title')}</h5>
      <p className={sharedModalStyles.subtext}>{t('map.classifications.modal.subtitle')}</p>
      <div className={styles.bulletsContainer}>
        <p className={styles.subtextBullet}>
          <span>{t('map.classifications.modal.unserved')}</span>
          {t('map.classifications.modal.unservedRange')}
        </p>
        <p className={styles.subtextBullet}>
          <span>{t('map.classifications.modal.underserved')}</span>
          {t('map.classifications.modal.underservedRange')}
        </p>
        <p className={styles.subtextBullet}>
          <span>{t('map.classifications.modal.served')}</span>
          {t('map.classifications.modal.servedRange')}
        </p>
        <p className={styles.subtextBullet}>
          <span>{t('map.classifications.modal.noInternet')}</span>
          {t('map.classifications.modal.noInternetDesc')}
        </p>
      </div>
    </>
  )
}