import {ReactElement} from "react";
import {styles} from "./styles/HomePage.style";
import ToolkitIntroductionSection from "./ToolkitIntroductionSection/ToolkitIntroductionSection";
import InternetInvestmentSection from "./InternetInvestmentSection/InternetInvestmentSection";
import ToolkitDetailSection from "./ToolkitDetailSection/ToolkitDetailSection";
import ToolkitRedirectionSection from "./ToolkitRedirectionSection/ToolkitRedirectionSection";

const HomePage = (): ReactElement => {
  return (
    <div style={styles.HomePage}>
      <ToolkitIntroductionSection />
      <InternetInvestmentSection />
      <ToolkitDetailSection />
      <ToolkitRedirectionSection />
    </div>
  )
}

export default HomePage;