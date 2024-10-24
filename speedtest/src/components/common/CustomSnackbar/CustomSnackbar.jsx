import React, { useState, useEffect } from 'react';
import styles from './custom_snackbar.module.css';
import snackbarError from '../../../assets/snackbar-error-icon.svg';
import snackbarClose from '../../../assets/snackbar-close-icon.svg';
import { SNACKBAR_TYPES } from '../../../context/AlertsContext';

const CustomSnackbar = ({ message, type, open, duration, onClose }) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getTypeIcon = () => {
    switch (type) {
      case SNACKBAR_TYPES.ERROR:
        return snackbarError;
      default:
        return snackbarError;
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.container} data-type={type}>
      <div className={styles.messageContainer}>
        <img src={getTypeIcon()} width={24} height={24} alt={'snackbar icon'}/>
        <div className={styles.message}>{message}</div>
      </div>
      <img src={snackbarClose} width={16} height={16} alt={'close snackbar'} onClick={() => { setVisible(false); if (onClose) onClose(); }}/>
    </div>
  );
};


export default CustomSnackbar;