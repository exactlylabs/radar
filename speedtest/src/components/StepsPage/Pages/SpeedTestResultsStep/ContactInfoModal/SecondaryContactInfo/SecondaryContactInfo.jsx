import styles from "../contact_info_modal.module.css";
import CustomInput from "../../../../../common/inputs/CustomInput/CustomInput";


const SecondaryContactInfo = ({handleInputChange}) => {
  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>Your first name</label>
        <CustomInput type={'text'}
                     placeholder={'Enter your first name'}
                     name={'firstName'}
                     onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={`${styles.label} speedtest--semi-bold`}>Your last name</label>
        <CustomInput type={'text'}
                     placeholder={'Enter your last name'}
                     name={'lastName'}
                     onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default SecondaryContactInfo;