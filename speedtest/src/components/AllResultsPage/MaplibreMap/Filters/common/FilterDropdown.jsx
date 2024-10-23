import styles from './filter_dropdown.module.css';
import dropdownCaretIcon from '../../../../../assets/dropdown-caret.svg';
import {useEffect, useRef, useState} from "react";

export default function FilterDropdown({
  label,
  iconSrc,
  children
}) {

  const dropdownRef = useRef(null);
  const isOpenRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {

    window.addEventListener('click', handleCloseIfClickedOutside);
    window.addEventListener('keydown', handleCloseIfEscapeKeyPressed);

    return () => {
      window.removeEventListener('click', handleCloseIfClickedOutside);
      window.removeEventListener('keydown', handleCloseIfEscapeKeyPressed);
    }
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const handleCloseIfClickedOutside = event => {
    if(!isOpenRef.current) return;
    if(!dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }

  const handleCloseIfEscapeKeyPressed = event => {
    if(!isOpenRef.current) return;
    if(event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  const toggleMenu = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  }

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button className={styles.dropdownButton}
              data-is-open={isOpen.toString()}
              onClick={toggleMenu}
      >
        <div className={styles.labelContainer}>
          <img src={iconSrc} width={16} height={16} alt={'dropdown filter icon'}/>
          {label}
        </div>
        <img src={dropdownCaretIcon} width={16} height={16} alt={'dropdown caret'}/>
      </button>
      <div className={styles.dropdownOptionsContainer}
           data-is-open={isOpen.toString()}
      >
        {children}
      </div>
    </div>
  )
}