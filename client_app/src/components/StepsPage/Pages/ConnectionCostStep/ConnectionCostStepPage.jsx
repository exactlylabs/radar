import CostInput from "./CostInputContainer/CostInputContainer";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";

const ConnectionCostStepPage = ({
  goForward,
  goBack,
  cost,
  setCost,
}) => {

  return (
    <div>
      <MyTitle text={'What’s your estimated monthly bill cost?'}/>
      <div>This helps us understand the average internet cost in your area.</div>
      <CostInput setCost={setCost} cost={cost}/>
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={!cost}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionCostStepPage;