import {useEffect, useRef, useState} from "react";
import styles from './auto_expanding_cards.module.css';
import plusIcon from '../../assets/images/plus-icon.svg';
import type {CardContent} from "./types.ts";

interface AutoExpandingCardsProps {
  content: CardContent[];
}

interface AutoExpandingCardProps {
  content: CardContent;
  isOpen: boolean;
  index: number;
  firstClosed: boolean;
  secondClosed: boolean;
  openCard: () => void;
  openNext: () => void;
}

// TODO: stop timer if mouse is over the open card

function AutoExpandingCard({content, isOpen, index, openCard, openNext, firstClosed, secondClosed}: AutoExpandingCardProps) {
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if(isOpen) {
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(openNext, 5000);
    } else {
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    
    return () => {
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [isOpen]);
  
  return (
    <div className={styles.card}
      data-open={isOpen.toString()}
      data-index={index.toString()}
      data-first-closed={firstClosed}
      data-second-closed={secondClosed}
    >
      <p className={styles.head}>{content.head}</p>
      <p className={styles.title}>{content.title}</p>
      {
        isOpen ?
          <p className={styles.content}>{content.content}</p> :
          <button className={styles.button} onClick={() => openCard()}>
            <img src={plusIcon.src} width={16} height={16} alt={'plus icon'}/>
          </button>
      }
      <div className={styles.loadingBar}></div>
    </div>
  )
}

const INDEXES = [0,1,2];

export default function AutoExpandingCards({content}: AutoExpandingCardsProps) {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState(0);
  
  return (
    <div className={styles.mainContainer}>
      { content.map((card, index) => (
        <AutoExpandingCard
          key={index}
          content={card}
          isOpen={currentOpenIndex === index}
          index={index}
          firstClosed={Math.min(...INDEXES.filter(i => i !== currentOpenIndex)) === index}
          secondClosed={Math.max(...INDEXES.filter(i => i !== currentOpenIndex)) === index}
          openCard={() => setCurrentOpenIndex(index)}
          openNext={() => setCurrentOpenIndex(prev => (prev + 1) % content.length)}
        />
      )) }
    </div>
  )
}