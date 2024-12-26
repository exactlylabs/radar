import React, {type ReactElement, useEffect, useMemo, useRef, useState} from "react";
import styles from './styles/carrousel.module.css';

interface CarrouselProps {
  children: ReactElement[];
  arrowLess?: boolean;
  fullWidth?: boolean;
  alignmentRefId?: string;
  elementCount?: number;
  variant?: 'default' | 'overview-data-collection';
}

const AUTOMATIC_SWITCH_INTERVAL = 8000;

/**
 * A carrousel component that can be used to scroll through a set of elements.
 * For this component to work as expected, it should be placed --outside-- of a
 * horizontally padded container, so it can reach both ends of the screen.
 * @param children
 * @param arrowLess
 * @param fullWidth
 * @param alignmentRefId
 * @param elementCount
 * @param variant
 * @constructor
 */
export default function Carrousel({children, arrowLess, fullWidth, alignmentRefId, elementCount, variant}: CarrouselProps) {
  
  const container = useRef<HTMLDivElement>(null);
  const carrousel = useRef<HTMLDivElement>(null);
  const cardSet = useRef<HTMLUListElement>(null);
  const automaticSwitchTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentElementIndex = useRef(0);
  const isDisabledNextRef = useRef(false);
  const switchDateRef = useRef(new Date());
  const timeLeftRef = useRef(AUTOMATIC_SWITCH_INTERVAL);
  const timePausedRef = useRef(0);
  const pauseTime = useRef(0);
  const forcedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [isDisabledNext, setIsDisabledNext] = useState(false);
  
  let isSmallScreen = window.innerWidth < 768;
  
  useEffect(() => {
    const breakParentPadding = () => {
      if (!cardSet.current || !container.current || !carrousel.current) return;
      isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen) return;
      if (alignmentRefId) {
        const alignmentRef = document.getElementById(alignmentRefId);
        if (alignmentRef) {
          const {left} = alignmentRef.getBoundingClientRect();
          cardSet.current.style.paddingInline = `${left}px`;
          return;
        }
      } else {
        const {left} = container.current.getBoundingClientRect();
        carrousel.current.style.marginLeft = `-${left}px`;
        carrousel.current.style.paddingLeft = `${left}px`;
      }
    }
    
    breakParentPadding();
    
    window.addEventListener('resize', breakParentPadding);
    if(isMobileDevice()) carrousel.current!.addEventListener('touchend', updateIndexBasedOnScroll);
    carrousel.current!.addEventListener('scrollend', updateIndexBasedOnScroll);
    if(arrowLess) {
      if(elementCount === undefined || elementCount === null) throw new Error('If carrousel is arrowLess, elementCount must be provided');
      setAutomaticSwitch();
      if(isMobileDevice()) carrousel.current!.addEventListener('touchstart', pauseAutomaticSwitch);
      carrousel.current!.addEventListener('scrollstart', pauseAutomaticSwitch);
    }
    return () => {
      window.removeEventListener('resize', breakParentPadding);
      if(isMobileDevice()) carrousel.current!.removeEventListener('touchend', updateIndexBasedOnScroll);
      carrousel.current!.removeEventListener('scrollend', updateIndexBasedOnScroll);
      if(automaticSwitchTimeout.current) {
        clearInterval(automaticSwitchTimeout.current);
      }
    }
  }, []);
  
  const isMobileDevice = () => {
    return matchMedia('(pointer: coarse)').matches && matchMedia('(hover: none)').matches;
  }
  
  const setAutomaticSwitch = () => {
    if(!arrowLess) return;
    if(automaticSwitchTimeout.current) {
      clearInterval(automaticSwitchTimeout.current);
    }
    automaticSwitchTimeout.current = setInterval(moveToNext, AUTOMATIC_SWITCH_INTERVAL);
    switchDateRef.current = new Date();
    timeLeftRef.current = AUTOMATIC_SWITCH_INTERVAL;
    timePausedRef.current = 0;
    pauseTime.current = 0;
  }
  
  const pauseAutomaticSwitch = () => {
    if(!arrowLess) return;
    const now = new Date();
    const lastPause = pauseTime.current === 0 ? switchDateRef.current : new Date(pauseTime.current);
    pauseTime.current = now.getTime();
    const timePassed = now.getTime() - lastPause.getTime();
    timeLeftRef.current = AUTOMATIC_SWITCH_INTERVAL - timePassed;
    if(automaticSwitchTimeout.current) {
      clearInterval(automaticSwitchTimeout.current);
    }
  }
  
  const playAutomaticSwitch = () => {
    if(!arrowLess) return;
    timePausedRef.current += pauseTime.current - new Date().getTime();
    automaticSwitchTimeout.current = setInterval(moveToNext, timeLeftRef.current);
  }
  
  const getItemWidth = (): number => {
    const cards = cardSet.current!.querySelectorAll('astro-slot > li');
    return cards[0].getBoundingClientRect().width;
  }
  
  const setCurrentDot = (nextIndex: number) => {
    const dots = document.querySelectorAll(`#${container.current!.id} .${styles.automaticDot}`);
    dots.forEach((dot, index) => {
      dot.setAttribute('data-selected', index === nextIndex ? 'true' : 'false');
    });
    setAutomaticSwitch();
  }
  
  const updateValuesManually = (nextIndex: number, scrollDistance: number) => {
    const remainingDistanceToEnd = carrousel.current!.scrollWidth - carrousel.current!.scrollLeft - carrousel.current!.clientWidth - scrollDistance;
    const remainingDistanceToStart = carrousel.current!.scrollLeft + scrollDistance;
    
    if(remainingDistanceToEnd <= 1) nextIndex = elementCount! - 1;
    else if(remainingDistanceToStart <= 1) nextIndex = 0;
    currentElementIndex.current = nextIndex;
    setIndex(nextIndex);
    isDisabledNextRef.current = nextIndex === elementCount! - 1;
    setIsDisabledNext(isDisabledNextRef.current);
  }
  
  const updateIndexBasedOnScroll = () => {
    if (!carrousel.current) return;
    let firstElementIndex = Math.floor(carrousel.current.scrollLeft / getItemWidth());
    const remainingDistanceToEnd = carrousel.current!.scrollWidth - carrousel.current!.scrollLeft - carrousel.current!.clientWidth;
    const remainingDistanceToStart = carrousel.current!.scrollLeft;
    
    if (arrowLess && remainingDistanceToEnd === 0) firstElementIndex = elementCount! - 1;
    else if (remainingDistanceToStart !== 0 && firstElementIndex === 0) firstElementIndex = 1;
    
    if(arrowLess && firstElementIndex === currentElementIndex.current) {
      setAutomaticSwitch();
      return;
    }
    
    currentElementIndex.current = firstElementIndex;
    setIndex(firstElementIndex);
    if(!arrowLess) {
      isDisabledNextRef.current = remainingDistanceToEnd <= 1;
    } else {
      isDisabledNextRef.current = firstElementIndex === elementCount! - 1;
      setCurrentDot(firstElementIndex);
      forcedRef.current = false;
      if(!isMobileDevice() && isMouseOver()) {
        pauseAutomaticSwitch();
        undoAllPauseStates();
        const automaticSwitcher = document.querySelector(`#${container.current!.id} .${styles.automaticSwitcher}`);
        let currentActiveAutomaticDot = automaticSwitcher!.querySelector(`.${styles.automaticDot}:nth-child(${firstElementIndex + 1})`);
        currentActiveAutomaticDot!.setAttribute('data-paused', 'true');
      }
    }
    setIsDisabledNext(isDisabledNextRef.current);
  }
  
  const isMouseOver = () => {
    const mousePosition = JSON.parse(document.body.getAttribute('data-mouse-position')!);
    if(!mousePosition) return false;
    const {x, y} = mousePosition;
    const carrouselRect = carrousel.current!.getBoundingClientRect();
    return x >= carrouselRect.left && x <= carrouselRect.right && y >= carrouselRect.top && y <= carrouselRect.bottom;
  }
  
  const undoAllPauseStates = () => {
    const allDots = document.querySelectorAll(`#${container.current!.id} .${styles.automaticDot}`);
    allDots.forEach(dot => {
      dot.removeAttribute('data-paused');
    });
  }
  
  const moveToFirst = () => {
    forcedRef.current = true;
    carrousel.current!.scrollTo({left: 0, behavior: 'smooth'});
    if(isMobileDevice()) moveToIndex(0);
  }
  
  const moveToNext = () => {
    if(arrowLess && isDisabledNextRef.current) {
      setCurrentDot(0);
      moveToFirst();
      return;
    }
    if (isDisabledNextRef.current) return;
    const remainingDistance = carrousel.current!.scrollWidth - carrousel.current!.scrollLeft - carrousel.current!.clientWidth;
    let scrollDistance = Math.min(getItemWidth(), remainingDistance);
    if(arrowLess) setCurrentDot(currentElementIndex.current + 1);
    carrousel.current!.scrollBy({left: scrollDistance, behavior: 'smooth'});
    if(isMobileDevice()) {
      updateValuesManually(currentElementIndex.current + 1, scrollDistance);
    }
  }
  
  const moveToPrevious = () => {
    const scrollDistance = Math.min(getItemWidth(), carrousel.current!.scrollLeft);
    carrousel.current!.scrollBy({left: -1 * scrollDistance, behavior: 'smooth'});
    setCurrentDot(currentElementIndex.current - 1);
    if(isMobileDevice()) {
      updateValuesManually(currentElementIndex.current - 1, -1 * scrollDistance);
    }
  }
  
  const moveToIndex = (index: number) => {
    currentElementIndex.current = index;
    setIndex(index);
    undoAllPauseStates();
    setCurrentDot(index);
    forcedRef.current = false;
    isDisabledNextRef.current = index === elementCount! - 1;
    setIsDisabledNext(isDisabledNextRef.current);
  }
  
  const arrowLessSwitcher = () => {
    return (
      <div className={styles.automaticSwitcher}>
        {
          Array.from({length: elementCount!}, (_, idx) => (
            <button
              key={idx}
              className={styles.automaticDot}
              onClick={() => {
                if(isMobileDevice()) return;
                forcedRef.current = true;
                const scrollDistance = getItemWidth() * idx;
                carrousel.current!.scrollTo({left: scrollDistance, behavior: 'smooth'});
              }}
              onTouchStart={() => {
                if(!isMobileDevice()) return;
                forcedRef.current = true;
                const scrollDistance = getItemWidth() * idx;
                carrousel.current!.scrollTo({left: scrollDistance, behavior: 'smooth'});
                moveToIndex(idx);
              }}
              data-selected={idx === index}
            >
            </button>
          ))
        }
      </div>
    )
  }
  
  const manualSwitcher = () => (
    <div className={styles.buttonsContainer}>
      <button
        className={styles.button}
        onClick={() => {
          if(!isMobileDevice()) moveToPrevious();
        }}
        onTouchStart={() => {
          if(isMobileDevice()) moveToPrevious();
        }}
        disabled={index === 0}
        data-direction="left"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             xmlnsXlink="http://www.w3.org/1999/xlink"
             width="16"
             height="16"
             data-color="white"
        >
          <path fill="rgba(255, 255, 255, 0.8)"
                transform="translate(1 7.25)"
                d="M0.75 0L12.250252 0C12.664466 -7.6089797e-17 13.000252 0.33578643 13.000252 0.75C13.000252 1.1642135 12.664466 1.5 12.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
                fillRule="evenodd"
          />
          <path fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(8.5 2.5)"
                d="M0 0L5.5023718 5.5L0 11"
                fillRule="evenodd"
          />
        </svg>
      </button>
      <button
        className={styles.button}
        onClick={() => {
          if(!isMobileDevice()) moveToNext();
        }}
        onTouchStart={() => {
          if(isMobileDevice()) moveToNext();
        }}
        disabled={isDisabledNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             xmlnsXlink="http://www.w3.org/1999/xlink"
             width="16"
             height="16"
             data-color="white"
        >
          <path fill="rgba(255, 255, 255, 0.8)"
                transform="translate(1 7.25)"
                d="M0.75 0L12.250252 0C12.664466 -7.6089797e-17 13.000252 0.33578643 13.000252 0.75C13.000252 1.1642135 12.664466 1.5 12.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
                fillRule="evenodd"
          />
          <path fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(8.5 2.5)"
                d="M0 0L5.5023718 5.5L0 11"
                fillRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
  
  const handleMouseOver = () => {
    if (!arrowLess) return;
    pauseAutomaticSwitch();
    const automaticSwitcher = document.querySelector(`#${container.current!.id} .${styles.automaticSwitcher}`);
    let currentActiveAutomaticDot = automaticSwitcher!.querySelector(`.${styles.automaticDot}[data-selected="true"]`);
    currentActiveAutomaticDot!.setAttribute('data-paused', 'true');
  }
  
  const handleMouseOut = () => {
    if (!arrowLess) return;
    playAutomaticSwitch();
    const automaticSwitcher = document.querySelector(`#${container.current!.id} .${styles.automaticSwitcher}`);
    const currentActiveAutomaticDot = automaticSwitcher!.querySelector(`.${styles.automaticDot}[data-selected="true"]`);
    currentActiveAutomaticDot!.removeAttribute('data-paused');
  }
  
  return (
    <div id={'scroll-gallery-feature-cards'} style={{width: '100%', margin: '0 auto', position: 'relative'}} ref={container}>
      <div className={styles.carrousel} ref={carrousel} data-full-width={fullWidth?.toString() ?? 'false'}>
        <ul className={styles.cardSet} data-variant={variant ?? 'default'} ref={cardSet}
          onMouseOver={handleMouseOver}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseOut}
          onTouchStart={handleMouseOver}
          onTouchEnd={handleMouseOut}
        >
          {children}
        </ul>
      </div>
      {arrowLess ? arrowLessSwitcher() : manualSwitcher()}
    </div>
  );
}