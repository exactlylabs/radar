import FilterDropdown from "./FilterDropdown";
import styles from './filter_dropdown.module.css';
import searchIcon from '../../../../../assets/search-icon.svg';

export default function FilterDropdownWithSearch({label, iconSrc, handleOnChange, children}) {
  return (
    <FilterDropdown label={label} iconSrc={iconSrc}>
      <div className={styles.searchInputContainer}>
        <img src={searchIcon}
             width={16}
             height={16}
             alt={'search icon'}
             className={styles.opaqueImage}
        />
        <input type={'text'}
               onChange={handleOnChange}
               className={styles.searchInput}
               placeholder={'Search...'}
        />
      </div>
      <div className={styles.scrollableContainer}>
        {children}
      </div>
    </FilterDropdown>
  )
}