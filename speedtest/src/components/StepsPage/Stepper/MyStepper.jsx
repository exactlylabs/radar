import {STEPS} from "../utils/steps";
import MyStepIcon from "./MyStepIcon";
import {DEFAULT_STEP_CONNECTOR_COLOR} from "../../../utils/colors";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const stepperContainerStyle = {
  width: '30%',
  margin: '10px auto 20px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
}

const mobileStepperContainerStyle = {
  ...stepperContainerStyle,
  margin: '30px auto 20px'
}

const stepConnectorStyle = {
  width: 20,
  height: 2,
  marginLeft: 5,
  marginRight: 5,
  backgroundColor: DEFAULT_STEP_CONNECTOR_COLOR,
}

const stepIconCustomSX = {
  maxWidth: 24,
}

const MyStepConnector = () => {
  return (
    <div style={stepConnectorStyle}>

    </div>
  )
}

const stepStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
}

const MyStep = ({children}) => {
  return (
    <div style={stepStyle}>
      {children}
    </div>
  )
}

const MyStepContent = ({icon}) => {
  return (
    <div style={stepIconCustomSX}>
      {icon}
    </div>
  )
}

const MyStepper = ({
  activeStep
}) => {

  const {isMediumSizeScreen, isSmallSizeScreen} = useViewportSizes();

  const getIcon = (step) => {
    if(step < activeStep) {
      return <MyStepIcon complete step={step}/>
    } else if(step === activeStep) {
      return <MyStepIcon active step={step}/>
    } else {
      return <MyStepIcon step={step}/>
    }
  }

  return (
    <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileStepperContainerStyle : stepperContainerStyle}>
      {
        Object.values(STEPS).filter(s => s !== STEPS.INITIAL).map(step => {
          if(step < STEPS.RUN_SPEED_TEST) {
           return (
              <MyStep key={step}>
                {step > STEPS.CONNECTION_ADDRESS && <MyStepConnector />}
                <MyStepContent icon={getIcon(step)}/>
              </MyStep>
            )
          }
        })
      }
    </div>
  );
}

export default MyStepper;