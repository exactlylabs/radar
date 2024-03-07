import {STEPS} from "../utils/steps";
import MyStepIcon from "./MyStepIcon";
import {DEFAULT_STEP_CONNECTOR_COLOR} from "../../../utils/colors";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {useContext} from "react";
import ConfigContext from "../../../context/ConfigContext";

const stepperContainerStyle = {
  width: '30%',
  margin: '0 auto 20px',
  paddingTop: '10px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
}

const mobileStepperContainerStyle = {
  ...stepperContainerStyle,
  margin: '0 auto 20px',
  paddingTop: '30px'
}

const widgetStepperContainerStyle = {
  ...stepperContainerStyle,
  margin: '0 auto 16px',
  paddingTop: '16px'
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

  const config = useContext(ConfigContext);
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

  const getStepperStyle = () => {
    if(config.widgetMode) return widgetStepperContainerStyle;
    else if(isSmallSizeScreen || isMediumSizeScreen) return mobileStepperContainerStyle;
    else return stepperContainerStyle;
  }

  return (
    <div style={getStepperStyle()}>
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