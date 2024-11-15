import {type ReactElement, useRef, useState} from "react";
import styles from './carrousel.module.css';
import arrowIcon from '../../assets/images/arrow.svg';

interface CarrouselProps {
  children: ReactElement[];
  elementCount: number;
}

const GAP = 32;

export default function Carrousel({children, elementCount}: CarrouselProps) {
  
  const carrousel = useRef<HTMLDivElement>(null);
  const [currentFirstElementIndex, setCurrentFirstElementIndex] = useState(0);
  
  const moveToNext = () => {
    if(!carrousel.current) return false;
    const refElement = carrousel.current.querySelector('div[data-index="0"]')!;
    const { width } = refElement.getBoundingClientRect();
    const currentMarginLeft = carrousel.current.style.marginLeft || '0px';
    carrousel.current.style.marginLeft = `calc(${currentMarginLeft} - ${width}px - ${GAP}px)`;
    setCurrentFirstElementIndex(prev => prev + 1);
  }
  
  const moveToPrevious = () => {
    if(!carrousel.current) return false;
    const newIndex = currentFirstElementIndex - 1;
    const refElement = carrousel.current.querySelector('div[data-index="0"]')!;
    const { width } = refElement.getBoundingClientRect();
    const currentMarginLeft = carrousel.current.style.marginLeft || '0px';
    carrousel.current.style.marginLeft = `calc(${currentMarginLeft} + ${width}px + ${GAP}px)`;
    setCurrentFirstElementIndex(newIndex < 0 ? 0 : newIndex);
  }
  
  return (
    <>
      <div className={styles.carrouselContainer}>
        <div className={styles.carrousel} ref={carrousel}>
          {children}
        </div>
      </div>
      <div className={styles.buttonsContainer}>
        <button
          className={styles.button}
          onClick={moveToPrevious}
          disabled={currentFirstElementIndex === 0}
          data-direction="left"
        >
          <img src={arrowIcon.src} width="16" height="16" alt="Arrow icon" />
        </button>
        <button
          className={styles.button}
          onClick={moveToNext}
          disabled={currentFirstElementIndex === elementCount - 1}
        >
          <img src={arrowIcon.src} width="16" height="16" alt="Arrow icon" />
        </button>
      </div>
    </>
  );
}