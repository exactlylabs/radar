import {useState} from "react";
import styles from './expansible_rows.module.css';
import type {CardContent} from "./types.ts";
import plusIcon from "../../assets/images/plus-icon.svg";

interface ExpansibleRowsProps {
  content: CardContent[];
}

interface ExpansibleRowProps {
  content: CardContent;
  isOpen: boolean;
  index: number;
  toggleOpen: (index: number) => void;
}

// TODO: make the text fade in a bit with opacity so the height growth doesn't feel choppy
function ExpansibleRow({content, isOpen, index, toggleOpen}: ExpansibleRowProps) {
  
  return (
    <div className={styles.row} data-open={isOpen.toString()}>
      <div className={styles.topRow} onClick={() => toggleOpen(index)}>
        <span className={styles.head}>{content.head}</span>
        <h4 className={styles.title}>{content.title}</h4>
        <button className={styles.button}>
          <img src={plusIcon.src} width={16} height={16} alt={'plus icon'}/>
        </button>
      </div>
      <div className={styles.contentContainer} data-open={isOpen.toString()}>
        <p className={styles.content}>{content.content}</p>
      </div>
    </div>
  )
}

export default function ExpansibleRows({content}: ExpansibleRowsProps) {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);

  const handleToggleOpen = (index: number) => {
    setCurrentOpenIndex(currentOpenIndex === index ? null : index);
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <ExpansibleRow content={content[0]} index={0} isOpen={currentOpenIndex === 0} toggleOpen={handleToggleOpen}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[1]} index={1} isOpen={currentOpenIndex === 1} toggleOpen={handleToggleOpen}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[2]} index={2} isOpen={currentOpenIndex === 2} toggleOpen={handleToggleOpen}/>
      </div>
      <div className={styles.column}>
        <ExpansibleRow content={content[3]} index={3} isOpen={currentOpenIndex === 3} toggleOpen={handleToggleOpen}/>
        <div className={styles.divider}></div>
        <ExpansibleRow content={content[4]} index={4} isOpen={currentOpenIndex === 4} toggleOpen={handleToggleOpen}/>
      </div>
    </div>
  );
}