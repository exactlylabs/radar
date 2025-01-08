import {GenericExpansibleRow} from "../common/wrappers/ExpansibleRows.tsx";
import styles from './styles/resources_related_links.module.css';
import buttonStyles from '../common/buttons/styles/buttons.module.css';
import {useState} from "react";

function GoToLink({href, text, withUnderline, secondary}: {href: string, text: string, withUnderline?: string, secondary?: boolean}) {
  return (
    <a href={href} target="_blank" className={buttonStyles.readMore} data-transparent='true' data-with-underline={withUnderline ?? 'false'} data-secondary={secondary ?? 'false'}>{text}
      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16">
        <path fill="white" transform="translate(3.41637 2.74119)"
              d="M9.099432 0C9.5136452 0 9.849432 0.33578643 9.849432 0.75L9.849432 7.75C9.849432 8.1642132 9.5136452 8.5 9.099432 8.5C8.6852188 8.5 8.349432 8.1642132 8.349432 7.75L8.349 2.5539999L1.2803301 9.6227751C0.98743689 9.9156685 0.51256311 9.9156685 0.21966991 9.6227751C-0.073223308 9.3298817 -0.073223308 8.8550081 0.21966991 8.5621147L7.2810001 1.5L2.0623853 1.5C1.6826895 1.5 1.3688943 1.2178462 1.319232 0.85177058L1.3123853 0.75C1.3123853 0.33578643 1.6481718 0 2.0623853 0L9.099432 0Z"
              fillRule="evenodd"/>
      </svg>
    </a>
  );
}

export default function ResourcesExpansibleResponsiveRows() {
  
  const [currentOpenBoxIndex, setCurrentOpenBoxIndex] = useState<number | null>(null);
  
  const handleClick = (index: number) => {
    if (currentOpenBoxIndex === index) {
      setCurrentOpenBoxIndex(null);
    } else {
      setCurrentOpenBoxIndex(index);
    }
  }
  
  return (
    <div className={styles.responsiveBoxesContainer}>
      <GenericExpansibleRow
        title={'Federal Communications Commission (FCC)'}
        content={(
          <div className={styles.linksGrid}>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://broadbandmap.fcc.gov/home" text="FCC National Broadband Map"/>
              <p>A comprehensive national broadband serviceable location (BSL) "fabric" map showing speeds, vendors,
                and
                broadband technology available at each BSL location.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink
                withUnderline="true"
                href="https://www.fcc.gov/reports-research/reports/measuring-broadband-america/measuring-fixed-broadband-thirteenth-report"
                text="FCC 13th (2024) Fixed Broadband Report"/>
              <p>Annual report on broadband speed testing conducted by the Federal Communications Commission.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink
                withUnderline="true"
                href="https://www.fcc.gov/reports-research/reports/measuring-broadband-america/measuring-broadband-america-mobile-data"
                text="Measuring Broadband America Mobile Data"/>
              <p>FCC report and downloadable apps for measuring mobile broadband.</p>
              <div className={styles.secondaryLinksContainer}>
                <GoToLink secondary withUnderline="true"
                          href="https://play.google.com/store/apps/details?id=com.agence3pp.fcc&hl=en_US"
                          text="Android App"/>
                <GoToLink secondary withUnderline="true"
                          href="https://apps.apple.com/us/app/fcc-mobile-speed-test/id6470025404" text="iOS App"/>
              </div>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://www.fcc.gov/broadbandlabels"
                        text="Broadband Consumer Labels"/>
              <p>The Federal Communications Commission released Broadband Labels that show clear and understandable
                information about the cost and performance of internet services.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true"
                href="https://docs.fcc.gov/public/attachments/DOC-401205A1.pdf"
                        text="Broadband Speed Benchmark"/>
              <p>In March 2024, the FCC updated high-speed broadband benchmarks, increasing them from 25/3 Megabits
                per
                second (or Mbps) to 100/20 Mbps for download and upload speeds</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true"
                href="https://www.fcc.gov/consumers/guides/broadband-speed-guide"
                        text="Broadband Speed Guide"/>
              <p>Compare common online activities with the minimum download speed (Megabits per second, or Mbps)
                needed
                for adequate performance. Speeds assume one activity at a time.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true"
                href="https://www.fcc.gov/general/rural-health-care-program"
                        text="FCC Rural Health Care Program"/>
              <p>A program to support telecommunications and broadband service for healthcare facilities to bring
                medical care to rural areas through increased connectivity.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://www.fcc.gov/general/lifeline-program-low-income-consumers" text="FCC Lifeline"/>
              <p>A program to discount the cost of phone or broadband service for qualifying low-income consumers.</p>
            </div>
          </div>
        )}
        isOpen={currentOpenBoxIndex === 0}
        index={0}
        toggleOpen={handleClick}
      />
      <GenericExpansibleRow
        title={'National Telecommunications and Information Administration (NTIA)'}
        content={(
          <div className={styles.linksGrid}>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://www.internetforall.gov/" text="Internet for All"/>
              <p>Information on broadband funding programs (including the Broadband Equity Access and Deployment (BEAD)
                Program, with links, contacts, and progress for each state.</p>
            </div>
          </div>
        )}
        isOpen={currentOpenBoxIndex === 1}
        index={1}
        toggleOpen={handleClick}
      />
      <GenericExpansibleRow
        title={'Department of Health and Human Services (HHS)'}
        content={(
          <div className={styles.linksGrid}>
            <div className={styles.linkBox}>
              <GoToLink
                withUnderline="true"
                href="https://telehealth.hhs.gov/providers/best-practice-guides/telehealth-for-rural-areas/access-to-internet-and-other-telehealth-resources"
                text="Telehealth.HHS.gov"/>
              <p>Discover more about increasing access to internet, expanding telehealth for rural areas, and other
                telehealth resources.</p>
            </div>
          </div>
        )}
        isOpen={currentOpenBoxIndex === 2}
        index={2}
        toggleOpen={handleClick}
      />
      <GenericExpansibleRow
        title={'U.S. Department of Agriculture (USDA)'}
        content={(
          <div className={styles.linksGrid}>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://www.usda.gov/broadband" text="https://www.usda.gov/broadband"/>
              <p>Learn about the work that USDA is investing in rural broadband.</p>
            </div>
          </div>
        )}
        isOpen={currentOpenBoxIndex === 3}
        index={3}
        toggleOpen={handleClick}
      />
      <GenericExpansibleRow
        title={'Non-Federal Resources'}
        content={(
          <div className={styles.linksGrid}>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://extension.psu.edu/penn-state-national-broadband-navigator"
                        text="National Broadband Navigator and Webinars"/>
              <p>An interactive map and webinar series created by Penn State Extension with funding from The Rockefeller
                Foundation. The navigator gives detailed information on health care resources, broadband availability,
                and community demographics useful to state and community planners, service providers and others wanting
                to understand broadband resources to plan for upcoming broadband deployment programs.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://info.americantelemed.org/disparities-advisory-group-toolkit"
                        text="Digital Infrastructure Disparities Map and Economic and Social Value-Added (ESVA) Calculator"/>
              <p>American Telemedicine Association (ATA) online interactive map to show digital infrastructure by zip
                code or county, highlighting where connectivity hinders health resource access, including a composite
                community digital infrastructure score. The ESVA Calculator estimates value of a broadband intervention
                for payers, providers, government, and business.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://www.speedtest.net/" text="Ookla"/>
              <p>Popular speed test for accurate internet metrics.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://speed.cloudflare.com/" text="Cloudflare"/>
              <p>Speed test with privacy-focused tools.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://fast.com/" text="Fast.com"/>
              <p>Quick speed test by Netflix.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://openspeedtest.com/" text="Open Speed Test"/>
              <p>Simple, browser-based speed testing.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://speedsmart.net/" text="Speed Smart"/>
              <p>Advanced speed test with detailed stats.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://testmy.net/" text="TestMy.net"/>
              <p>Unique tests for real-world internet performance.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://speed.measurementlab.net/#/" text="M-Lab Speed Test"/>
              <p>Open-source test backed by data transparency.</p>
            </div>
            <div className={styles.linkBox}>
              <GoToLink withUnderline="true" href="https://speedof.me/" text="Speedof.me"/>
              <p>HTML5 speed test optimized for mobile devices.</p>
            </div>
          </div>
        )}
        isOpen={currentOpenBoxIndex === 4}
        index={4}
        toggleOpen={handleClick}
      />
    </div>
  )
}