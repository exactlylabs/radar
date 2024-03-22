import styles from "../contact_info_modal.module.css";
import CustomInput from "../../../../../common/inputs/CustomInput/CustomInput";

const InitialContactInfo = ({handleInputChange}) => {
  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>Your email address</label>
        <CustomInput type={'email'}
                     placeholder={'your@email.com'}
                     name={'email'}
                     onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>Your phone number <span>(optional)</span></label>
        <CustomInput type={'phone'}
                     placeholder={'+1 (000) 000-0000'}
                     name={'phone'}
                     onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default InitialContactInfo;