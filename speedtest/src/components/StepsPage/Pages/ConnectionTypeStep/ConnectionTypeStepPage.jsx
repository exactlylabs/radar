import {useEffect} from "react";
import MyOptionPicker from "../../../common/MyOptionPicker";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {types} from "../../../../utils/networkTypes";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionTypeStepPage = ({
  goForward,
  goBack,
  selectedOption,
  setSelectedOption,
  warning
}) => {

  useEffect(() => {
    // TODO: once decided how to define if user is using a cellular
    // network, then apply this userAgent logic + network combined
    // to automatically pick the cellular option by default.
    /*const userAgent = navigator.userAgent;
    if(isMobile(userAgent)) setSelectedOption(2);*/
  }, [])

  return (
    <div>
      <MyTitle text={'How are you connected?'}/>
      <div style={subtitleStyle}>Choose how you are connected to the internet.</div>
      <MyOptionPicker options={types}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
      />
      { warning && <MyMessageSnackbar message={warning} type={'warning'}/> }
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={selectedOption === null}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionTypeStepPage;