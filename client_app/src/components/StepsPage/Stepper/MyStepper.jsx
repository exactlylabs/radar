import {Step, StepConnector, StepIcon, StepLabel, Stepper} from "@mui/material";
import {steps} from "../utils/steps";
import MyStepIcon from "./MyStepIcon";
import {DEFAULT_STEP_CONNECTOR_COLOR} from "../../../utils/colors";
import {useIsMediumSizeScreen} from "../../../hooks/useIsMediumSizeScreen";

const stepperContainerStyle = {
  width: '30%',
  margin: '50px auto 20px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
}

const mobileStepperContainerStyle = {
  ...stepperContainerStyle,
  margin: '30px auto 15px'
}

const stepConnectorStyle = {
  width: 10,
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

  const isMediumSizeScreen = useIsMediumSizeScreen();

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
    <div style={isMediumSizeScreen ? mobileStepperContainerStyle : stepperContainerStyle}>
      {
        Object.values(steps).map(step => {
          if(step < steps.RUN_SPEED_TEST) {
           return (
              <MyStep key={step}>
                {step > steps.CONNECTION_ADDRESS && <MyStepConnector />}
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