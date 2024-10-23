import styles from './connection_type_filter.module.css';
import {useState} from "react";

function wiredIcon(active) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16">
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(7.5 13)" d="M0.5 2.3L0.5 0" fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(5 1)"
            d="M0 4L0 1.1428572C0 0.51167458 0.53725833 0 1.2 0L4.8000002 0C5.4627419 0 6 0.51167458 6 1.1428572L6 4"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(3.5 5)"
            d="M8.4375 0L0.5625 0C0.25183982 0 0 0.25583729 0 0.5714286L0 3.5314286C0.0012426992 3.8312457 0.11841282 4.1185594 0.32624999 4.3314285L1.6875 5.7142859L1.6875 6.8571429C1.6875 7.4883256 2.1911798 8 2.8125 8L6.1875 8C6.8088202 8 7.3125 7.4883256 7.3125 6.8571429L7.3125 5.7142859L8.6737499 4.3314285C8.881587 4.1185594 8.9987574 3.8312457 9 3.5314286L9 0.5714286C9 0.25583729 8.7481604 0 8.4375 0Z"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(7.5 7.44231)" d="M0 0.5L1 0.5" fillRule="evenodd"/>
    </svg>
  )
}

function wifiIcon(active) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16">
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(6.58923 10.9843)"
            d="M1.4107692 2.8233588C2.189923 2.8233588 2.8215384 2.1913409 2.8215384 1.4116902C2.8215384 0.63203961 2.189923 0 1.4107692 0C0.63162613 0 0 0.63203961 0 1.4116902C0 2.1913409 0.63162613 2.8233588 1.4107692 2.8233588Z"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(5.34 8.09116)"
            d="M0 1.1366842C0.35018307 0.77694577 0.76883692 0.49102363 1.2312354 0.29580384C1.6936338 0.10057331 2.1904292 0 2.6923077 0C3.1941862 0 3.6909816 0.10057331 4.1533799 0.29580384C4.6157784 0.49102363 5.0344214 0.77694577 5.3846154 1.1366842"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(3.00307 5.32504)"
            d="M0 2.0818772C0.65553385 1.4220999 1.4349569 0.89851093 2.293437 0.5412187C3.151917 0.18393719 4.0725245 0 5.0023079 0C5.9320798 0 6.8526878 0.18393719 7.7111678 0.5412187C8.5696259 0.89851093 9.349103 1.4220999 10.004626 2.0818772"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(1 2.5)"
            d="M0 2.9024124C0.91907847 1.982263 2.0103354 1.2523441 3.2114277 0.75433755C4.4125094 0.25633103 5.6998844 0 7 0C8.3001156 0 9.587491 0.25633103 10.788615 0.75433755C11.989708 1.2523441 13.080954 1.982263 14 2.9024124"
            fillRule="evenodd"/>
    </svg>
  );
}

function cellularIcon(active) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16">
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.3333334" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(3 1)"
            d="M2.6153846 0L7.3846154 0C8.829052 -2.6533879e-16 10 1.1709476 10 2.6153846L10 11.384616C10 12.829052 8.829052 14 7.3846154 14L2.6153846 14C1.1709476 14 5.3253549e-16 12.829052 4.4408921e-16 11.384616L4.4408921e-16 2.6153846C2.671967e-16 1.1709476 1.1709476 6.2098172e-16 2.6153846 4.4408921e-16L2.6153846 0Z"
            fillRule="evenodd"/>
      <path fill="none" stroke={active ? '#4B7BE5' : '#6D6A94'} strokeWidth="1.3333334" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(6.49999 10.5)" d="M0 0.5L3 0.5" fillRule="evenodd"/>
    </svg>

  );
}

function connectionTypeIcon(key, active) {
  switch (key) {
    case 'Wired':
      return wiredIcon(active);
    case 'Wifi':
      return wifiIcon(active);
    case 'Cellular':
      return cellularIcon(active);
    default:
      throw new Error('Invalid icon key');
  }
}

export default function ConnectionTypeFilter() {

  // TODO: have a filter context object shared across the app
  // this is just for testing toggling and styles at first
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (key) => {
    if (activeFilters.includes(key)) {
      setActiveFilters(activeFilters.filter((item) => item !== key));
    } else {
      setActiveFilters([...activeFilters, key]);
    }
  }

  return (
    <div className={styles.container}>
      {['Wired', 'Wifi', 'Cellular'].map(key => (
        <button className={styles.button}
                data-active={activeFilters.includes(key)}
                onClick={() => toggleFilter(key)}
        >
          {connectionTypeIcon(key, activeFilters.includes(key))}
          {key}
        </button>
      ))}
    </div>
  );
}