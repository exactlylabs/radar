import styles from './expected_speed_input.module.css';

const ExpectedSpeedInput = ({ initialValue, type, handleChange }) => {
  
  const getLabel = () => type === 'download' ? 'Download speed' : 'Upload speed';
  
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>{getLabel()} <span>(expected)</span></label>
      <input type={'text'}
             placeholder={'0'}
             className={styles.input}
             onChange={handleChange}
             data-input-type={type}
             value={initialValue}
      />
    </div>
  )
}

export default ExpectedSpeedInput;