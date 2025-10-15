import CostInput from "./CostInputContainer/CostInputContainer";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useContext} from "react";
import UserDataContext from "../../../../context/UserData";
import { useTranslation } from 'react-i18next';

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionCostStepPage = ({
  goForward,
  goBack
}) => {
  const { t } = useTranslation();
  const {userData, setNetworkCost} = useContext(UserDataContext);

  return (
    <div>
      <MyTitle text={t('connectionCost.title')}/>
      <div style={subtitleStyle}>{t('connectionCost.subtitle')}</div>
      <CostInput setCost={setNetworkCost} cost={userData.networkCost}/>
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={userData.networkCost === null || userData.networkCost === undefined}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionCostStepPage;