import {useState} from "react";
import styles from './styles/homepage_approach_expansible_rows.module.css';
import {ExpansibleRow} from "../common/wrappers/ExpansibleRows.tsx";

export default function HomepageApproachExpansibleRows() {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);
  
  const handleToggle = (index: number) => {
    setCurrentOpenIndex((prev) => prev === index ? null : index);
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.divider}></div>
      <ExpansibleRow content={{
        head: '01',
        title: 'Community Engagement Efforts',
        content: 'We worked closely with local partners and community leaders to understand rural connectivity needs. By engaging directly with residents through surveys, interviews, and events, we ensured the data collected reflected the real challenges faced by these communities.'
      }}
                     isOpen={currentOpenIndex === 0}
                     index={0}
                     toggleOpen={() => handleToggle(0)}
      />
      <div className={styles.divider}></div>
      <ExpansibleRow content={{
        head: '02',
        title: 'Tools and Methods for Data Collection',
        content: 'The project developed a variety of tools to measure broadband performance, including monitoring Pods, speed test widgets, and mobile data collection. These tools provided reliable data on internet quality, helping to map connectivity gaps in rural regions accurately.'
      }}
                     isOpen={currentOpenIndex === 1}
                     index={1}
                     toggleOpen={() => handleToggle(1)}
      />
      <div className={styles.divider}></div>
      <ExpansibleRow content={{
        head: '03',
        title: 'Analyzing Connectivity Challenges',
        content: 'Our analysis focused on understanding how connectivity issues impact rural communities. By examining the collected data, we identified patterns in broadband performance and barriers to telehealth adoption, offering communities insights into their unique digital landscape.'
      }}
                     isOpen={currentOpenIndex === 2}
                     index={2}
                     toggleOpen={() => handleToggle(2)}
      />
      <div className={styles.divider}></div>
    </div>
  )
}