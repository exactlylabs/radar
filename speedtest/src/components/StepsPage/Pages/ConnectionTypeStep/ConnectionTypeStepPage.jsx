import {useContext, useEffect} from "react";
import MyOptionPicker from "../../../common/MyOptionPicker";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {types} from "../../../../utils/networkTypes";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import UserDataContext from "../../../../context/UserData";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionTypeStepPage = ({
  goForward,
  goBack,
  setSelectedOption,
  warning
}) => {

  const {userData} = useContext(UserDataContext);

  return (
    <div>
      <MyTitle text={'How are you connected?'}/>
      <div style={subtitleStyle}>Choose how you are connected to the internet.</div>
      <MyOptionPicker options={types}
                      selectedOption={userData.networkType}
                      setSelectedOption={setSelectedOption}
      />
      { warning && <MyMessageSnackbar message={warning} type={'warning'}/> }
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={userData.networkType === null}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionTypeStepPage;