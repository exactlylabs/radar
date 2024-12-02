import {useState} from "react";
import styles from './styles/homepage_expanisble_rows.module.css';
import {ExpansibleRow} from "../common/wrappers/ExpansibleRows.tsx";

import broadbandMappingImage from '../../assets/images/broadband-mapping.webp';
import siteMonitoringImage from '../../assets/images/site-monitoring.webp';
import webBasedSpeedTestImage from '../../assets/images/web-based-speed-test.webp';
import coverageGapIdentificationImage from '../../assets/images/coverage-gap-identification.webp';

export default function HomepageExpansibleRows() {
  
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(0);
  
  const handleToggleCard = (index: number) => {
    setCurrentOpenIndex(currentOpenIndex === index ? null : index);
  }
  
  return (
    <div className={styles.expansibleRowsContainer}>
      <div className={styles.rowsContainer}>
        <div className={styles.divider}></div>
        <ExpansibleRow
          content={{
            title: 'Broadband Mapping',
            content: "Compare your town's internet speeds and coverage with neighboring regions. Identify underserved areas and potential issues in local broadband infrastructure."
          }}
          isOpen={currentOpenIndex === 0}
          index={0}
          toggleOpen={handleToggleCard}
        />
        <div className={styles.divider}></div>
        <ExpansibleRow
          content={{
            title: 'Site Monitoring',
            content: "Deploy internet monitoring devices at key locations in your community to gather continuous, real-time data on connection quality, including speed, stability, and outages over time."
          }}
          isOpen={currentOpenIndex === 1}
          index={1}
          toggleOpen={handleToggleCard}
        />
        <div className={styles.divider}></div>
        <ExpansibleRow
          content={{
            title: 'Web-based Speed Test',
            content: "Collect real-time data on internet connections by encouraging community members to take speed tests. Help them identify speed issues or outages in different areas."
          }}
          isOpen={currentOpenIndex === 2}
          index={2}
          toggleOpen={handleToggleCard}
        />
        <div className={styles.divider}></div>
        <ExpansibleRow
          content={{
            title: 'Coverage Gap Identification',
            content: "Use our driving-based data to identify mobile internet gaps and problem areas in rural regions."
          }}
          isOpen={currentOpenIndex === 3}
          index={3}
          toggleOpen={handleToggleCard}
        />
        <div className={styles.divider}></div>
      </div>
      <div className={styles.imagesContainer}>
        { (!currentOpenIndex || currentOpenIndex === 0) && <img src={broadbandMappingImage.src} alt={'Broadband Image'}/> }
        { currentOpenIndex === 1 && <img src={siteMonitoringImage.src} alt={'Site Monitoring Image'}/> }
        { currentOpenIndex === 2 && <img src={webBasedSpeedTestImage.src} alt={'Web-based Speed Test Image'}/> }
        { currentOpenIndex === 3 && <img src={coverageGapIdentificationImage.src} alt={'Coverage Gap Identification Image'}/> }
      </div>
    </div>
  );
}