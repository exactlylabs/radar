import {useState} from "react";
import styles from './styles/approach_expansible_rows.module.css';
import {ExpansibleRow} from "../common/wrappers/ExpansibleRows.tsx";

export default function ApproachExpansibleRows() {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);
  
  const handleToggleCard = (index: number) => {
    setCurrentOpenIndex(currentOpenIndex === index ? null : index);
  }
  
  return (
    <div className={styles.expansibleRowsContainer}>
      <div className={styles.column}>
        <ExpansibleRow
          content={{
            head: '01',
            title: 'Pod Data Collection',
            content: "Physical devices were installed in homes and public facilities to gather real-time data on internet speed, reliability, and bandwidth use."
          }}
          isOpen={currentOpenIndex === 0}
          index={0}
          toggleOpen={handleToggleCard}
          variant={'overview-project-metrics'}
        />
        <ExpansibleRow
          content={{
            head: '02',
            title: 'ISP and Mobile Provider Data',
            content: "Comprehensive data collection from various ISPs and mobile providers, including miles of mobile networks tested, to assess service variations and coverage quality across broadband and mobile networks in rural communities."
          }}
          isOpen={currentOpenIndex === 2}
          index={2}
          toggleOpen={handleToggleCard}
          variant={'overview-project-metrics'}
        />
        <ExpansibleRow
          content={{
            head: '03',
            title: 'Publications and Research Contributions',
            content: "Number of publications produced by the Rural Telehealth Evaluation Center (RTEC) focused on broadband access, rural telehealth, and connectivity issues. These publications contribute to the broader understanding of telehealth access challenges and inform policymakers and community advocates alike."
          }}
          isOpen={currentOpenIndex === 4}
          index={4}
          toggleOpen={handleToggleCard}
          variant={'overview-project-metrics'}
        />
      </div>
      <div className={styles.column}>
        <ExpansibleRow
          content={{
            head: '04',
            title: 'Unique Speed Test Locations',
            content: "Number of speed tests conducted at unique locations, providing targeted insights into connectivity quality across diverse geographies. This data helps identify specific sites with connectivity issues, offering more precise, localized insights than are available from existing aggregated datasets."
          }}
          isOpen={currentOpenIndex === 1}
          index={1}
          toggleOpen={handleToggleCard}
          variant={'overview-project-metrics'}
        />
        <ExpansibleRow
          content={{
            head: '05',
            title: 'Community Engagement Metrics',
            content: "Tracking local involvement and feedback from residents through surveys, interviews, and interactions with online tools. This data offers qualitative insights into broadband needs and helps prioritize areas for improvement."
          }}
          isOpen={currentOpenIndex === 3}
          index={3}
          toggleOpen={handleToggleCard}
          variant={'overview-project-metrics'}
        />
      </div>
    </div>
  );
}