import {type ReactElement, useEffect, useRef, useState} from "react";
import styles from './carrousel.module.css';

interface CarrouselProps {
  children: ReactElement[];
  itemWidth?: number; // in pixels, really useful to send over in order to make the scroll smooth
  arrowLess?: boolean;
  fullWidth?: boolean;
}

const arrowBlack = () => (
  <svg xmlns="http://www.w3.org/2000/svg"
       xmlnsXlink="http://www.w3.org/1999/xlink"
       width="16"
       height="16"
       data-color="black"
  >
    <path fill="black"
          transform="translate(1 7.25)"
          d="M0.75 0L12.250252 0C12.664466 -7.6089797e-17 13.000252 0.33578643 13.000252 0.75C13.000252 1.1642135 12.664466 1.5 12.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
          fillRule="evenodd"
    />
    <path fill="none"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(8.5 2.5)"
          d="M0 0L5.5023718 5.5L0 11"
          fillRule="evenodd"
    />
  </svg>
);

const arrowWhite = () => (
  <svg xmlns="http://www.w3.org/2000/svg"
       xmlnsXlink="http://www.w3.org/1999/xlink"
       width="16"
       height="16"
       data-color="white"
  >
    <path fill="white"
          transform="translate(1 7.25)"
          d="M0.75 0L12.250252 0C12.664466 -7.6089797e-17 13.000252 0.33578643 13.000252 0.75C13.000252 1.1642135 12.664466 1.5 12.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
          fillRule="evenodd"
    />
    <path fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(8.5 2.5)"
          d="M0 0L5.5023718 5.5L0 11"
          fillRule="evenodd"
    />
  </svg>
);

/**
 * A carrousel component that can be used to scroll through a set of elements.
 * For this component to work as expected, it should be placed --outside-- of a
 * horizontally padded container, so it can reach both ends of the screen.
 * @param children
 * @param itemWidth
 * @param arrowLess
 * @param fullWidth
 * @constructor
 */
export default function Carrousel({children, itemWidth, arrowLess, fullWidth}: CarrouselProps) {
  
  const container = useRef<HTMLDivElement>(null);
  const carrousel = useRef<HTMLDivElement>(null);
  const itemContainer = useRef<HTMLDivElement>(null);
  const cardSet = useRef<HTMLDivElement>(null);
  const [currentFirstElementIndex, setCurrentFirstElementIndex] = useState(0);
  const [isDisabledNext, setIsDisabledNext] = useState(false);
  
  useEffect(() => {
    const breakParentPadding = () => {
      if (!container.current || !carrousel.current || !itemContainer.current) return;
      const {left} = container.current.getBoundingClientRect();
      carrousel.current.style.marginLeft = `-${left}px`;
      carrousel.current.style.paddingLeft = `${left}px`;
    }
    
    breakParentPadding();
    
    window.addEventListener('resize', breakParentPadding);
    carrousel.current!.addEventListener('scroll', updateIndexBasedOnScroll);
    return () => {
      window.removeEventListener('resize', breakParentPadding);
      carrousel.current!.removeEventListener('scroll', updateIndexBasedOnScroll);
    }
  }, []);
  
  const getItemWidth = () => {
    if(fullWidth) {
      const cards = cardSet.current!.querySelectorAll('[data-carrousel-card]');
      return cards[0].getBoundingClientRect().width;
    }
    return itemWidth || 300;
  }
  
  const updateIndexBasedOnScroll = () => {
    if(!carrousel.current) return;
    const firstElementIndex = Math.floor(carrousel.current.scrollLeft / getItemWidth());
    setCurrentFirstElementIndex(firstElementIndex);
    const remainingDistance = carrousel.current!.scrollWidth - carrousel.current!.scrollLeft - carrousel.current!.clientWidth;
    if(remainingDistance <= 1) {
      setIsDisabledNext(true);
    } else {
      setIsDisabledNext(false);
    }
  }
  
  const moveToNext = () => {
    if(isDisabledNext) return;
    const remainingDistance = carrousel.current!.scrollWidth - carrousel.current!.scrollLeft - carrousel.current!.clientWidth;
    let scrollDistance = Math.min(getItemWidth(), remainingDistance);
    carrousel.current!.scrollBy({left: scrollDistance, behavior: 'smooth'});
  }
  
  const moveToPrevious = () => {
    carrousel.current!.scrollBy({left: -getItemWidth(), behavior: 'smooth'});
  }
  
  return (
    <div id={'scroll-gallery-feature-cards'} ref={container}>
      <div className={styles.carrousel} ref={carrousel} data-full-width={fullWidth?.toString() ?? 'false'}>
        <div className={styles.itemContainer} ref={itemContainer} data-full-width={fullWidth?.toString() ?? 'false'}>
          <div className={styles.cardSet} ref={cardSet}>
            {children}
          </div>
        </div>
      </div>
      { !arrowLess &&
        <div className={styles.buttonsContainer}>
          <button
            className={styles.button}
            onClick={moveToPrevious}
            disabled={currentFirstElementIndex === 0}
            data-direction="left"
          >
            {arrowBlack()}
            {arrowWhite()}
          </button>
          <button
            className={styles.button}
            onClick={moveToNext}
            disabled={isDisabledNext}
          >
            {arrowBlack()}
            {arrowWhite()}
          </button>
        </div>
      }
    </div>
  );
}