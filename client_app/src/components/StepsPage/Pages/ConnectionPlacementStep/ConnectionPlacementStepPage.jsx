import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyOptionPicker from "../../../common/MyOptionPicker";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {placementOptions} from "../../../../utils/placements";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {warnings} from "../../../../utils/messages";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useState} from "react";
import MyNoConnectionConfirmationModal from "./MyNoConnectionConfirmationModal";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionPlacementStepPage = ({
  goForward,
  goBack,
  selectedOption,
  setSelectedOption,
  warning,
  address,
  goToLastFlowStep
}) => {

  const [shouldExecuteAlt, setShouldExecuteAlt] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleSelectOption = index => {
    if(index === 3) {
      setShouldExecuteAlt(true);
    } else {
      setShouldExecuteAlt(false);
    }
    setSelectedOption(index);
  }

  const openConfirmationModal = () => setIsConfirmationModalOpen(true);

  const closeConfirmationModal = () => setIsConfirmationModalOpen(false);

  return (
    <div>
      <MyTitle text={'Where do you have Internet?'}/>
      <div style={subtitleStyle}>Choose the option that best applies.</div>
      <MyOptionPicker options={placementOptions}
                      needsDivider
                      dividerIndex={3}
                      selectedOption={selectedOption}
                      setSelectedOption={handleSelectOption}
      />
      { warning && <MyMessageSnackbar message={warnings.NOT_ENOUGH_DATA} type={'warning'}/> }
      <MyStepSwitcher goForward={goForward}
                      goBack={goBack}
                      forwardDisabled={selectedOption === null}
                      altForward={openConfirmationModal}
                      shouldExecuteAlt={shouldExecuteAlt}
      />
      <PreferNotToAnswer goForward={goForward}/>
      <MyNoConnectionConfirmationModal open={isConfirmationModalOpen}
                                       close={closeConfirmationModal}
                                       address={address}
                                       goToLastFlowStep={goToLastFlowStep}
      />
    </div>
  )
}

export default ConnectionPlacementStepPage;