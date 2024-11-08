import {useContext, useEffect, useRef} from "react";
import styles from './cost_slider.module.css';
import FiltersContext from "../../../../../context/FiltersContext";


const distributionMock = [
  { count: 0, value: 0, visible: true },
  { count: 0, value: 5, visible: true },
  { count: 0, value: 10, visible: true },
  { count: 3, value: 15, visible: true },
  { count: 4, value: 20, visible: true },
  { count: 2, value: 25, visible: true },
  { count: 10, value: 30, visible: true },
  { count: 10, value: 35, visible: true },
  { count: 8, value: 40, visible: true },
  { count: 8, value: 43, visible: true },
  { count: 8, value: 47, visible: true },
  { count: 23, value: 48, visible: true },
  { count: 34, value: 50, visible: true },
  { count: 50, value: 52, visible: true },
  { count: 75, value: 53, visible: true },
  { count: 45, value: 55, visible: true },
  { count: 34, value: 58, visible: true },
  { count: 23, value: 59, visible: true },
  { count: 14, value: 60, visible: true },
  { count: 12, value: 65, visible: true },
  { count: 4, value: 70, visible: true },
  { count: 18, value: 75, visible: true },
  { count: 20, value: 80, visible: true },
  { count: 7, value: 85, visible: true },
  { count: 9, value: 90, visible: true },
]

/**
 * CostSlider Component
 * All values are mocked and just for initial testing purposes for now, until we have the
 * real data coming from our backend.
 */
export default function CostSlider() {

  const { filters, setMinPrice, setMaxPrice } = useContext(FiltersContext);
  const { minPrice, maxPrice, maxCost } = filters;

  const minSliderRef = useRef(null);
  const maxSliderRef = useRef(null);
  const minInputRef = useRef(null);
  const maxInputRef = useRef(null);
  let distribution = [];

  const distributionMax = Math.max(...distributionMock.map(distribution => distribution.count));

  const {costDistributionList, setCostDistributionList} = useContext(FiltersContext);

  useEffect(() => {
    if(maxCost) {
      createDistribution();
      paintSpaceInBetween();
    }
  }, [maxCost]);

  const handleSlide = event => {
    const slider = event.target.getAttribute('data-slider');
    const value = Number(event.target.value);
    if (slider === 'min') {
      if(value > Number(maxSliderRef.current.value)) return;
      setMinPrice(value);
      minInputRef.current.value = value;
    } else {
      if(value < Number(minSliderRef.current.value)) return;
      setMaxPrice(value);
      maxInputRef.current.value = value;
    }
    paintSpaceInBetween();
  }

  const handleInputChange = event => {
    const input = event.target.getAttribute('data-input');
    let value = event.target.value;
    if(value === '') {
      if(input === 'min') setMinPrice('');
      else setMaxPrice('');
      return;
    }
    value = Number(event.target.value);
    if (input === 'min') {
      if(value <= Number(maxSliderRef.current.value)) {
        minSliderRef.current.value = value;
      }
      setMinPrice(value);
    } else {
      if(value >= Number(minSliderRef.current.value)) {
        maxSliderRef.current.value = value;
      }
      setMaxPrice(value);
    }
    paintSpaceInBetween();
  }

  const handleInputBlur = event => {
    const input = event.target.getAttribute('data-input');
    const value = event.target.value;
    if(value === '') {
      if(input === 'min') {
        setMinPrice(minSliderRef.current.min);
        minInputRef.current.value = minSliderRef.current.min;
        minSliderRef.current.value = minSliderRef.current.min;
      } else {
        setMaxPrice(maxSliderRef.current.max);
        maxInputRef.current.value = maxSliderRef.current.max;
        maxSliderRef.current.value = maxSliderRef.current.max;
      }
    } else {
      if(input === 'min') {
        if (value < 0) {
          setMinPrice(0);
          minInputRef.current.value = 0;
        } else if (value > Number(maxSliderRef.current.value)) {
          setMinPrice(maxSliderRef.current.value);
          minInputRef.current.value = maxSliderRef.current.value;
        }
      } else {
        if (value > 100) {
          setMaxPrice(100);
          maxInputRef.current.value = 100;
        } else if (value < Number(minSliderRef.current.value)) {
          setMaxPrice(minSliderRef.current.value);
          maxInputRef.current.value = minSliderRef.current.value;
        }
      }
    }
    paintSpaceInBetween();
  }

  const paintSpaceInBetween = () => {
    const range = minSliderRef.current.max - minSliderRef.current.min;
    const fromPosition = minSliderRef.current.value - maxSliderRef.current.min;
    const toPosition = maxSliderRef.current.value - maxSliderRef.current.min;
    maxSliderRef.current.style.background = `linear-gradient(
      to right, 
      #E3E3E8 0%, 
      #E3E3E8 ${fromPosition / range * 100}%, 
      #3F3C70 ${fromPosition / range * 100}%, 
      #3F3C70 ${toPosition / range * 100}%, 
      #E3E3E8 ${toPosition / range * 100}%, 
      #E3E3E8 100%
    )`;
    setInvisibleBars();
  }

  const setInvisibleBars = () => {
    const minPrice = Number(minSliderRef.current.value);
    const maxPrice = Number(maxSliderRef.current.value);
    distributionMock.forEach(distribution => {
      distribution.visible = distribution.value >= minPrice && distribution.value <= maxPrice;
    });
  }

  const handleBarClicked = event => {
    const barValue = Number(event.target.dataset.value);
    const currentMinPrice = Number(minSliderRef.current.value);
    const currentMaxPrice = Number(maxSliderRef.current.value);
    const diffToMin = Math.abs(currentMinPrice - barValue);
    const diffToMax = Math.abs(currentMaxPrice - barValue);
    if(diffToMin < diffToMax) {
      setMinPrice(barValue);
      minSliderRef.current.value = barValue;
      minInputRef.current.value = barValue;
    } else {
      setMaxPrice(barValue);
      maxSliderRef.current.value = barValue;
      maxInputRef.current.value = barValue;
    }
    paintSpaceInBetween();
  }

  return (
    <div className={styles.fullContainer}>
      <div className={styles.slidersContainer}>
        <input type={'range'}
               min={'0'}
               max={maxCost}
               value={minPrice === '' ? minSliderRef.current.value : minPrice}
               className={styles.slider}
               data-slider={'min'}
               onChange={handleSlide}
               ref={minSliderRef}
        />
        <input type={'range'}
               min={'0'}
               max={maxCost}
               value={maxPrice === '' ? maxSliderRef.current.value : maxPrice}
               className={styles.slider}
               data-slider={'max'}
               onChange={handleSlide}
               ref={maxSliderRef}
        />
        { maxSliderRef.current &&
          <div className={styles.barsContainer}>
            {distributionMock.map((distribution, index) => (
              <div key={distribution.value}
                   style={{
                     height: distribution.count * 1.0 / distributionMax * 100 + '%',
                     width: 1 / distributionMock.length * 100 + '%',
                     minWidth: 2,
                     maxWidth: 4,
                     minHeight: 2,
                     left: distribution.value / maxSliderRef.current.max * 100 + '%',
                   }}
                   data-visible={distribution.visible}
                   className={styles.bar}
                   data-value={distribution.value}
                   onClick={handleBarClicked}
              >
              </div>
            ))}
          </div>
        }
      </div>
      <div className={styles.inputsContainer}>
        <div className={styles.inputContainer}>
          <label className={styles.label}>Minimum</label>
          <div className={styles.inputAndSignContainer}>
            <span className={styles.dollarSign}>$</span>
            <input type={'number'}
                   data-input={'min'}
                   value={minPrice}
                   className={styles.input}
                   onChange={handleInputChange}
                   onBlur={handleInputBlur}
                   ref={minInputRef}
            />
          </div>
        </div>
        <span className={styles.inputDivider}>-</span>
        <div className={styles.inputContainer}>
          <label className={styles.label}>Maximum</label>
          <div className={styles.inputAndSignContainer}>
            <span className={styles.dollarSign}>$</span>
            <input type={'number'}
                   data-input={'max'}
                   value={maxPrice}
                   className={styles.input}
                   onChange={handleInputChange}
                   onBlur={handleInputBlur}
                   ref={maxInputRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}