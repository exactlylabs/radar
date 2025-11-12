import styles from './expected_speed_input.module.css';
import downloadIcon from '../../../../../assets/download-icon.png';
import uploadIcon from '../../../../../assets/upload-icon.png';
import {forwardRef} from "react";
import { useTranslation } from 'react-i18next';

const ExpectedSpeedInput = forwardRef(({initialValue, type, handleChange}, ref ) => {
  const { t } = useTranslation();

  const getLabel = () => type === 'download' ? t('expectedSpeeds.input.download') : t('expectedSpeeds.input.upload');
  
  return (
    <div className={styles.inputContainer}>
      <div className={styles.labelContainer}>
        <img src={type === 'download' ? downloadIcon : uploadIcon} width={16} height={16} alt={type === 'download' ? t('alt.icons.download') : t('alt.icons.upload')}/>
        <label className={styles.label}>{getLabel()} <span>{t('common.labels.optional')}</span></label>
      </div>
      <input type={'number'}
             placeholder={t('expectedSpeeds.input.placeholder')}
             className={styles.input}
             data-input-type={type}
             defaultValue={initialValue}
             key={type}
             ref={ref}
      />
    </div>
  )
});

export default ExpectedSpeedInput;