import {ReactElement} from "react";
import {styles} from "./styles/HomePage.style";

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