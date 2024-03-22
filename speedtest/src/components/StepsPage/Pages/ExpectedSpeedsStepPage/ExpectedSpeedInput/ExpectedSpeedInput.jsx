import styles from './expected_speed_input.module.css';
import downloadIcon from '../../../../../assets/download-icon.png';
import uploadIcon from '../../../../../assets/upload-icon.png';
import {forwardRef} from "react";

const ExpectedSpeedInput = forwardRef(({initialValue, type, handleChange}, ref ) => {

  const getLabel = () => type === 'download' ? 'Download speed' : 'Upload speed';
  
  return (
    <div className={styles.inputContainer}>
      <div className={styles.labelContainer}>
        <img src={type === 'download' ? downloadIcon : uploadIcon} width={16} height={16} alt={`${type} icon`}/>
        <label className={styles.label}>{getLabel()} <span>(optional)</span></label>
      </div>
      <input type={'number'}
             placeholder={'E.g. 20'}
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