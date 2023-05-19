import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyOptionPicker from "../../../common/MyOptionPicker";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import {MyTitle} from "../../../common/MyTitle";
import {placementOptions} from "../../../../utils/placements";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {warnings} from "../../../../utils/messages";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useContext, useState} from "react";
import MyNoConnectionConfirmationModal from "./MyNoConnectionConfirmationModal";
import userData from "../../../../context/UserData";
import UserDataContext from "../../../../context/UserData";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ConnectionPlacementStepPage = ({
  goForward,
  goBack,
  warning,
  goToLastFlowStep
}) => {

  const [shouldExecuteAlt, setShouldExecuteAlt] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const {userData, setNetworkLocation} = useContext(UserDataContext);

  const handleSelectOption = index => {
    if(index === 3) {
      setShouldExecuteAlt(true);
    } else {
      setShouldExecuteAlt(false);
    }
    setNetworkLocation(placementOptions[index]);
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
                      selectedOption={userData.networkLocation}
                      setSelectedOption={handleSelectOption}
      />
      { warning && <MyMessageSnackbar message={warnings.NOT_ENOUGH_DATA} type={'warning'}/> }
      <MyStepSwitcher goForward={goForward}
                      goBack={goBack}
                      forwardDisabled={userData.networkLocation === null}
                      altForward={openConfirmationModal}
                      shouldExecuteAlt={shouldExecuteAlt}
      />
      <PreferNotToAnswer goForward={goForward}/>
      <MyNoConnectionConfirmationModal open={isConfirmationModalOpen}
                                       close={closeConfirmationModal}
                                       address={userData.address}
                                       goToLastFlowStep={goToLastFlowStep}
      />
    </div>
  )
}

export default ConnectionPlacementStepPage;