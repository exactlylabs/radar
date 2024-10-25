import React, { useEffect, useRef } from 'react';
import styles from './custom_snackbar.module.css';
import snackbarError from '../../../assets/snackbar-error-icon.svg';
import snackbarClose from '../../../assets/snackbar-close-icon.svg';
import { SNACKBAR_TYPES } from '../../../context/AlertsContext';

const CustomSnackbar = ({ message, type, open, duration, onClose }) => {

  const timerRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [open]);

  const getTypeIcon = () => {
    switch (type) {
      case SNACKBAR_TYPES.ERROR:
        return snackbarError;
      default:
        return snackbarError;
    }
  };

  if (!open) return null;

  return (
    <div className={styles.container} data-type={type}>
      <div className={styles.messageContainer}>
        <img src={getTypeIcon()} width={24} height={24} alt={'snackbar icon'}/>
        <div className={styles.message}>{message}</div>
      </div>
      <img src={snackbarClose} className={styles.closeButton} width={16} height={16} alt={'close snackbar'} onClick={() => { if (onClose) onClose(); }}/>
    </div>
  );
};


export default CustomSnackbar;