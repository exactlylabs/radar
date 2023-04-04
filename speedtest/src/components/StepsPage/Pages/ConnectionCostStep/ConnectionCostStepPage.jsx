import CostInput from "./CostInputContainer/CostInputContainer";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useContext} from "react";
import UserDataContext from "../../../../context/UserData";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionCostStepPage = ({
  goForward,
  goBack
}) => {

  const {userData, setNetworkCost} = useContext(UserDataContext);

  return (
    <div>
      <MyTitle text={`What's your estimated monthly bill cost?`}/>
      <div style={subtitleStyle}>This helps us understand the average internet cost in your area.</div>
      <CostInput setCost={setNetworkCost} cost={userData.networkCost}/>
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={userData.networkCost === null || userData.networkCost === undefined}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionCostStepPage;