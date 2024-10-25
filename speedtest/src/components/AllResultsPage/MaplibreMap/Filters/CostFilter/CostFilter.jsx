import {useState} from "react";
import styles from './cost_filter.module.css';
import CostSlider from "./CostSlider";

export default function CostFilter() {

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);

  const handleCheckboxChange = () => {}

  return (
    <div className={styles.container}>
      <CostSlider minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}/>
      <div className={styles.checkboxContainer}>
        <input id={'include-no-cost'} type={'checkbox'} className={styles.checkbox} onChange={handleCheckboxChange}/>
        <label htmlFor={'include-no-cost'} className={styles.label}>Include results with no cost information.</label>
      </div>
    </div>
  );
}