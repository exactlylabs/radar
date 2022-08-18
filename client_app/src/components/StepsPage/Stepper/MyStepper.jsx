import {Step, StepConnector, StepIcon, StepLabel, Stepper} from "@mui/material";
import {steps} from "../utils/steps";
import MyStepIcon from "./MyStepIcon";

const stepperContainerStyle = {
  width: '30%',
  margin: '50px auto 20px'
}

const stepConnectorCustomSX = {
  left: 'calc(-50% + 10px)',
}

const stepIconCustomSX = {
  maxWidth: 24,
}

const MyStepper = ({
  activeStep
}) => {

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
    <div style={stepperContainerStyle}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {
          Object.values(steps).map(step => {
            if(step < steps.RUN_SPEED_TEST) {
             return (
                <Step key={step}>
                  {step > steps.CONNECTION_ADDRESS && <StepConnector sx={stepConnectorCustomSX}/>}
                  <StepIcon icon={getIcon(step)} sx={stepIconCustomSX}/>
                </Step>
              )
            }
          })
        }
      </Stepper>
    </div>
  );
}

export default MyStepper;