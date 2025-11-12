import styles from "../contact_info_modal.module.css";
import CustomInput from "../../../../../common/inputs/CustomInput/CustomInput";
import { useTranslation } from 'react-i18next';

const InitialContactInfo = ({handleInputChange}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>{t('testResults.contactInfo.email.label')}</label>
        <CustomInput type={'email'}
                     placeholder={t('testResults.contactInfo.email.placeholder')}
                     name={'email'}
                     onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>{t('testResults.contactInfo.phone.label')} <span>{t('common.labels.optional')}</span></label>
        <CustomInput type={'phone'}
                     placeholder={t('testResults.contactInfo.phone.placeholder')}
                     name={'phone'}
                     onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default InitialContactInfo;