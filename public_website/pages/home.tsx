import {ReactElement, useEffect} from "react";
import {styles} from "../src/components/HomePage/styles/HomePage.style";
import ToolkitIntroductionSection from "../src/components/HomePage/ToolkitIntroductionSection/ToolkitIntroductionSection";
import InternetInvestmentSection from "../src/components/HomePage/InternetInvestmentSection/InternetInvestmentSection";
import ToolkitDetailSection from "../src/components/HomePage/ToolkitDetailSection/ToolkitDetailSection";
import ToolkitRedirectionSection from "../src/components/HomePage/ToolkitRedirectionSection/ToolkitRedirectionSection";
import Frame from "../src/components/Frame/Frame";
import {ViewportContextProvider} from "../src/context/ViewportContent";

const Home = (): ReactElement => {

  useEffect(() => {
    document.title = 'Radar - Internet Speed Test and Monitoring for Better Broadband Investments';
  }, []);

  return (
    <ViewportContextProvider>
      <Frame>
        <div style={styles.HomePage}>
          <ToolkitIntroductionSection />
          <InternetInvestmentSection />
          <ToolkitDetailSection />
          <ToolkitRedirectionSection />
        </div>
      </Frame>
    </ViewportContextProvider>
  )
}

export default Home;