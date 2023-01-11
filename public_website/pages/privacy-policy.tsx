import {ReactElement} from "react";
import {ViewportContextProvider} from "../src/context/ViewportContent";
import PrivacyPolicyContent from "../src/components/PrivacyPolicyPage/PrivacyPolicyContent";

const PrivacyPolicyPage = (): ReactElement => (
  <ViewportContextProvider>
    <PrivacyPolicyContent/>
  </ViewportContextProvider>
);

export default PrivacyPolicyPage;