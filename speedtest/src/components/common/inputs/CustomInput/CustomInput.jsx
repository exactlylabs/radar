import styles from './custom_input.module.css';

const CustomInput = ({ type, placeholder, name, onChange, autofocus }) => (
  <input type={type}
         placeholder={placeholder}
         name={name}
         onChange={onChange}
         className={styles.input}
         autoFocus={autofocus}
  />
);

export default CustomInput;