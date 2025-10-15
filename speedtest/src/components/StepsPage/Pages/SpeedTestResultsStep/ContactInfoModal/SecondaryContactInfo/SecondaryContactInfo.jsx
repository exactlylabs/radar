import styles from "../contact_info_modal.module.css";
import CustomInput from "../../../../../common/inputs/CustomInput/CustomInput";
import { useTranslation } from 'react-i18next';

const SecondaryContactInfo = ({handleInputChange}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>{t('testResults.contactInfo.firstName.label')}</label>
        <CustomInput type={'text'}
                     placeholder={t('testResults.contactInfo.firstName.placeholder')}
                     name={'firstName'}
                     onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>{t('testResults.contactInfo.lastName.label')}</label>
        <CustomInput type={'text'}
                     placeholder={t('testResults.contactInfo.lastName.placeholder')}
                     name={'lastName'}
                     onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default SecondaryContactInfo;