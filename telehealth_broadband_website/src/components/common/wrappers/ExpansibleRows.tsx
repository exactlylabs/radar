import {useState} from "react";
import styles from './styles/expansible_rows.module.css';
import type {CardContent} from "../types.ts";
import plusIcon from "../../../assets/icons/plus.svg";
import minusIcon from "../../../assets/icons/minus.svg";

interface ExpansibleRowsProps {
  variant?: 'default' | 'overview-project-metrics';
  content: CardContent[];
}

interface ExpansibleRowProps {
  variant?: 'default' | 'overview-project-metrics';
  content: CardContent;
  isOpen: boolean;
  index: number;
  toggleOpen: (index: number) => void;
}

// TODO: make the text fade in a bit with opacity so the height growth doesn't feel choppy
export function ExpansibleRow({variant, content, isOpen, index, toggleOpen}: ExpansibleRowProps) {
  
  return (
    <div className={styles.row} data-open={isOpen.toString()} data-variant={variant}>
      <div className={styles.topRow} onClick={() => toggleOpen(index)}>
        { content.head && <span className={styles.head}>{content.head}</span> }
        <h4 className={styles.title}>{content.title}</h4>
        <button className={styles.button}>
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16" data-type="plus">
            <path fill="white" transform="translate(1 7.25)"
                  d="M0.75 0L13.250252 0C13.664466 -7.6089797e-17 14.000252 0.33578643 14.000252 0.75C14.000252 1.1642135 13.664466 1.5 13.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
                  fillRule="evenodd"/>
            <path fill="white" transform="matrix(-4.37114e-08 1 -1 -4.37114e-08 8.75013 0.999874)"
                  d="M0.75 0L13.250252 0C13.664466 -7.6089797e-17 14.000252 0.33578643 14.000252 0.75C14.000252 1.1642135 13.664466 1.5 13.250252 1.5L0.75 1.5C0.33578643 1.5 2.5363265e-17 1.1642135 0 0.75C-5.072653e-17 0.33578643 0.33578643 5.072653e-17 0.75 0Z"
                  fillRule="evenodd"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16" data-type="minus">
            <path fill="white" transform="translate(1 7.25)"
                  d="M0.75 0L13.250252 0C13.664466 0 14.000252 0.33578643 14.000252 0.75C14.000252 1.1642135 13.664466 1.5 13.250252 1.5L0.75 1.5C0.33578643 1.5 0 1.1642135 0 0.75C0 0.33578643 0.33578643 0 0.75 0Z"
                  fillRule="evenodd"/>
          </svg>
        </button>
      </div>
      <div className={styles.contentContainer} data-open={isOpen.toString()}>
        <p className={styles.content}>{content.content}</p>
      </div>
    </div>
  )
}

export default function ExpansibleRows({content, variant}: ExpansibleRowsProps) {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);
  
  const handleToggleOpen = (index: number) => {
    setCurrentOpenIndex(currentOpenIndex === index ? null : index);
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <ExpansibleRow content={content[0]} index={0} isOpen={currentOpenIndex === 0} toggleOpen={handleToggleOpen} variant={variant}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[1]} index={1} isOpen={currentOpenIndex === 1} toggleOpen={handleToggleOpen} variant={variant}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[2]} index={2} isOpen={currentOpenIndex === 2} toggleOpen={handleToggleOpen} variant={variant}/>
      </div>
      <div className={styles.column}>
        <ExpansibleRow content={content[3]} index={3} isOpen={currentOpenIndex === 3} toggleOpen={handleToggleOpen} variant={variant}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[4]} index={4} isOpen={currentOpenIndex === 4} toggleOpen={handleToggleOpen} variant={variant}/>
      </div>
    </div>
  );
}