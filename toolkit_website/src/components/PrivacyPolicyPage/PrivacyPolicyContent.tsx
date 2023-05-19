import {styles} from "./styles/PrivacyPolicyPage.style";
import Frame from "../Frame/Frame";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {ReactElement} from "react";

const PrivacyPolicyContent = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <Frame isDifferentColorFooter
           footerHeight={!isSmall ? '188px' : undefined}
           footerMargin={!isSmall ? '35px auto auto' : undefined}
    >
      <div style={styles.PrivacyPolicyPage(isSmall)}>
        <div style={styles.PrivacyPolicyPageContent(isSmall)}>
          {isSmall && <p className={'fw-extra-bold'} style={styles.SmallMainTitle}>Privacy Policy</p>}
          {
            !isSmall &&
            <div style={styles.LeftColumn}>
              <p className={'fw-extra-bold'} style={styles.MainTitle}>Privacy Policy</p>
              <div style={styles.IndexSection}>
                <a href={'/privacy-policy#for-radar'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>For
                  Radar</a>
                <br/>
                <a href={'/privacy-policy#what'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>What
                  Information Does Radar Collect?</a>
                <br/>
                <a href={'/privacy-policy#how'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>How Do
                  We Use The Information We Collect?</a>
                <br/>
                <a href={'/privacy-policy#when'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>When
                  Do We Share Information?</a>
                <br/>
                <a href={'/privacy-policy#service-providers'} className={'fw-bold hover-opaque'}
                   style={styles.SectionTitle}>Service Providers</a>
                <br/>
                <a href={'/privacy-policy#children-policy'} className={'fw-bold hover-opaque'}
                   style={styles.SectionTitle}>What’s our Policy On Children?</a>
                <br/>
                <a href={'/privacy-policy#choices'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>What
                  Are Your Choices?</a>
                <br/>
                <a href={'/privacy-policy#changes'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>Changes
                  To This Privacy Policy</a>
                <br/>
                <a href={'/privacy-policy#contact'} className={'fw-bold hover-opaque'} style={styles.SectionTitle}>Who
                  Should You Contact With Questions?</a>
                <br/>
              </div>
            </div>
          }
          <div style={styles.RightColumn(isSmall)}>
            <p id={'for-radar'} className={'fw-bold'} style={styles.TextSectionTitle}>For Radar</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>This Privacy Policy describes how Alaska Native
              Tribal Health Consortium (“ANTHC,” “we,” or “us”) collects, uses, and discloses information when you use our
              RADAR services. RADAR provides a web- and mobile-based tool for testing Internet speeds at consumer and
              community locations.<br/>
              This ANTHC Privacy Policy is meant to help you understand what information we collect, how we use that
              information, third parties with whom we may share the information, and why we collect it. If you use our RADAR
              application, then you agree to the collection and use of information as set forth in this Privacy Policy. If
              you do not agree with this Privacy Policy, do not access or use the RADAR App or Website.<br/>
              This Privacy Policy applies only to data collected via our RADAR mobile application (“RADAR App”) and our
              RADAR website at https://speedtest.exactlylabs.com (“Website”). This Privacy Policy does not apply to third
              party products or services used in connection with the RADAR App or Website (“Services Providers”), which are
              governed by each Service Provider’s privacy policy.
            </p>
            <p id={'what'} className={'fw-bold'} style={styles.TextSectionTitle}>What Information Does Radar Collect?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>When you use the RADAR App or Website, we may
              collect analytics information by automated means, such as the following: the number of times a user opens or
              closes the RADAR App; the IP address of the device used to connect to the RADAR App or Website; latitude and
              longitude coordinates as provided by the user and their browser or mobile device; the number of times an
              Internet speed test was performed; speed test results for each test taken; crashes; time on pages; page views;
              number of clicks on certain pages; site navigation patterns; device platform usage (android vs. iOS);
              operating system version; and answers to questions or questionnaires provided through the RADAR App and
              Website.<br/>
              We may integrate third party software with our RADAR application. For example, RADAR uses the Measurement Lab
              (M-Lab) NDT7 tool to perform Internet speed tests, and OpenStreetMap™ provides RADAR’s mapping functionality.
              M-Lab collects unprocessed Internet speed test data and makes the results of tests available to the public.
              OpenStreetMap™ collects certain analytics information which it uses to improve the functionality and
              performance of their mapping products. Please review M-Lab’s Privacy Policy at <a className={'custom-link'}
                href={'https://www.measurementlab.net/privacy'}>https://www.measurementlab.net/privacy/</a>, and
              OpenStreetMap’s Privacy Policy at <a className={'custom-link'}
                href={'https://wiki.osmfoundation.org/wiki/Privacy_Policy'}>https://wiki.osmfoundation.org/wiki/Privacy_Policy.</a><br/>
              We may engage Service Providers to provide analytics services for the RADAR App and Website. These Service
              Providers may use cookies, web beacons, device identifiers, and other technologies to collect information
              about your use of the RADAR App and Website, including your IP address, web browser, mobile network
              information, pages viewed, time spent on pages or in mobile apps, links clicked, and conversion information.
              This information may be used by us and others to, among other things, analyze and track data, determine the
              popularity of certain content, and better understand your online activity
            </p>
            <p id={'how'} className={'fw-bold'} style={styles.TextSectionTitle}>How Do We Use The Information We
              Collect?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>Internet speed test results and geolocation data
              are used to create maps of available Internet speeds, and raw data may be analyzed by data scientists, state
              and federal policy makers, and community organizations involved in broadband research and delivery.<br/>
              We will use the RADAR App and Website analytics information to troubleshoot, improve performance and
              functionality, and development enhancements and new features to RADAR functionality. To the extent
              practicable, this analytical information is anonymized and aggregated with other information so that you or
              your device may be identified.
            </p>
            <p id={'when'} className={'fw-bold'} style={styles.TextSectionTitle}>When Do We Share Information?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>We may share and disclose information we collect
              about our users in the following limited circumstances:</p>
            <div style={styles.HighlightSection(isSmall)}>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>We will share Internet speed test results
                and geolocation information with researchers involved in a Health Resources Services Administration
                (HRSA)-funded project in order to support data analysis, mapping, and validation (HRSA Grant
                GA540183-01-00).</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>We may share information with third party
                Service Providers, vendors, and consultants who we employ to perform tasks on our behalf. These companies
                include app analytics companies (e.g., Google Analytics), data collection vendors (e.g., M-Lab), and
                application developers (e.g., Exactly Labs), and others.</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Under certain circumstances, we may be
                required to disclose your personal information if we believe the disclosure is in accordance with, or
                required by, any applicable law, including lawful requests by public authorities to meet national security
                or law enforcement requirements.</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>We may share aggregated information and
                non-identifying information that cannot reasonably be used to identify you.</p>
            </div>
            <p id={'service-providers'} className={'fw-bold'} style={styles.TextSectionTitle}>Service Providers</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>We use third party Service Providers and products
              to help us provide the services related to the RADAR App and Website. Service Providers may help us:</p>
            <div style={styles.HighlightSection(isSmall)}>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Collect analytics data for our use.</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Assist us in performing product
                development, maintenance, and debugging.</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Provide services through third party
                platforms and software tools (e.g., integrating third party software with our RADAR App or Website).</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Assist us in analyzing how the RADAR App
                and Website are used.</p>
            </div>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>These Service Providers have limited access to
              your information to perform these tasks on our behalf, and are contractually bound to protect it and may not
              use the information for any other purpose.
              Links to Other Sites: RADAR may contain links to other sites. If you click on a third-party link, you will be
              directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise
              you to review the privacy policy of these websites. We have no control over and assume no responsibility for
              the content, privacy policies, or practices of any third-party sites or services.
            </p>
            <p id={'children-policy'} className={'fw-bold'} style={styles.TextSectionTitle}>What’s our Policy On
              Children?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>The RADAR App and Website are intended only for
              adults. We do not knowingly collect information from children under the age of 13. Any child under the age of
              13 should not use the RADAR App or Website. If we learn RADAR has collected personal information from a child
              under the age of 13, we will promptly delete this information.</p>
            <p id={'choices'} className={'fw-bold'} style={styles.TextSectionTitle}>What Are Your Choices?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>
              <i>Location Information:</i> When you first launch the RADAR App, you will be asked to consent to the app’s
              collection of location information. If you initially consent to our collection of such location information,
              you can subsequently stop the collection of this information at any time by changing the preferences on your
              mobile device. You may also stop our collection of this location information by following the standard
              uninstall process to remove the RADAR App from your device. If you stop our collection of this location
              information, the location features of our RADAR App may no longer function properly.<br/>
            </p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>
              <i>Cookies:</i> Most web browsers are set to accept cookies by default. If you prefer, you can usually adjust
              your browser settings to remove or reject browser cookies. Please note that removing or rejecting cookies
              could affect the availability and functionality of our RADAR App or Website.
            </p>
            <p id={'changes'} className={'fw-bold'} style={styles.TextSectionTitle}>Changes To This Privacy Policy</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>We may update or change our Privacy Policy from
              time to time without notice, so please review it periodically to keep informed of any changes and to ensure
              you are always aware of our information practices. If this Privacy Policy changes in any way, we will post an
              updated version on this page and/or link.</p>
            <p id={'contact'} className={'fw-bold'} style={styles.TextSectionTitle}>Who Should You Contact With
              Questions?</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>Contact Us. If you have any questions or concerns
              about this Privacy Policy, please contact ANTHC as follows: <a
                href={'mailto:radar@anthc.org'} className={'custom-link'}>RADAR@anthc.org</a>.</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export default PrivacyPolicyContent;