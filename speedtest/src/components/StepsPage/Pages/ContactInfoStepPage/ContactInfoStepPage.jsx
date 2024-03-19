import { MyTitle } from "../../../common/MyTitle";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import UserDataContext from "../../../../context/UserData";

const ContactInfoStepPage = ({
  goForward,
  goBack
}) => {

  const { userData, setExpectedSpeeds } = useContext(UserDataContext);

  return (
    <div>
      <MyTitle text={`What are your expected Internet speeds?`} />
      <div style={subtitleStyle}>Tell us a bit more about your service.</div>
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={!userData.expectedDownloadSpeed && !userData.expectedUploadSpeed} />
      <PreferNotToAnswer goForward={goForward} />
    </div>
  );
}

export default ContactInfoStepPage;