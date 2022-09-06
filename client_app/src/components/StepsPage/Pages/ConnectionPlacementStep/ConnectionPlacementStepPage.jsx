import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyOptionPicker from "../../../common/MyOptionPicker";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {placementOptions} from "../../../../utils/placements";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {warnings} from "../../../../utils/messages";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionPlacementStepPage = ({
  goForward,
  goBack,
  selectedOption,
  setSelectedOption,
  warning
}) => {

  return (
    <div>
      <MyTitle text={'Where do you have Internet?'}/>
      <div style={subtitleStyle}>Choose the option that best applies.</div>
      <MyOptionPicker options={placementOptions}
                      needsDivider
                      dividerIndex={3}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
      />
      { warning && <MyMessageSnackbar message={warnings.NOT_ENOUGH_DATA} type={'warning'}/> }
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={selectedOption === null}/>
      <PreferNotToAnswer goForward={goForward}/>
    </div>
  )
}

export default ConnectionPlacementStepPage;