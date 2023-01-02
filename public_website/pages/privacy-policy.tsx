import {ReactElement} from "react";
import {styles} from "../src/components/PrivacyPolicyPage/styles/PrivacyPolicyPage.style";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";

const PrivacyPolicyPage = (): ReactElement => (
  <ViewportContextProvider>
    <Frame>
      <div style={styles.PrivacyPolicyPage}>
        <div style={styles.PrivacyPolicyPageContent}>
          <div style={styles.LeftColumn}>
            <p className={'fw-extra-bold'} style={styles.MainTitle}>Privacy Policy</p>
            <div style={styles.IndexSection}>
              <p className={'fw-bold hover-opaque'} style={styles.SectionTitle}>1. Section Title</p>
              <div>
                <p className={'fw-bold hover-opaque'} style={styles.SubsectionTitle}>1.1. Subsection Title</p>
                <p className={'fw-bold hover-opaque'} style={styles.SubsectionTitle}>1.2. Subsection Title</p>
              </div>
            </div>
            <div style={styles.IndexSection}>
              <p className={'fw-bold hover-opaque'} style={styles.SectionTitle}>2. Section Title</p>
              <div>
                <p className={'fw-bold hover-opaque'} style={styles.SubsectionTitle}>2.1. Subsection Title</p>
                <p className={'fw-bold hover-opaque'} style={styles.SubsectionTitle}>2.2. Subsection Title</p>
              </div>
            </div>
          </div>
          <div style={styles.RightColumn}>
            <p className={'fw-bold'} style={styles.TextSectionTitle}>1. Section Title</p>
            <p className={'fw-medium'} style={styles.TextSectionParagraph}>Radar lets you run speed tests outdoors and indoors, compare results over time, and explore your neighborhood to get a better idea of how broadband looks like around you.</p>
            <div>
              <p className={'fw-bold'} style={styles.TextSectionSubtitle}>1.1 Subsection Title</p>
              <p className={'fw-medium'} style={styles.TextSectionParagraph}>Radar lets you run speed tests outdoors and indoors, compare results over time, and explore your neighborhood to get a better idea of how broadband looks like around you.</p>
            </div>
            <div style={styles.HighlightSection}>
              <p className={'fw-bold'} style={styles.TextSectionSubtitle}>Highlighted section</p>
              <p className={'fw-medium'} style={styles.HighlightSectionParagraph}>Radar lets you run speed tests outdoors and indoors, compare results over time, and explore your neighborhood to get a better idea of how broadband looks like around you.</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  </ViewportContextProvider>
);

export default PrivacyPolicyPage;