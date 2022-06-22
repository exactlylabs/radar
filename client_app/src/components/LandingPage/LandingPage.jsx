import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import {useState} from "react";
import {MyTitle} from "../common/MyTitle";
import {MyButton} from "../common/MyButton";
import {STEPS} from "../../constants";

const landingPageStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  overflowY: 'auto',
  maxWidth: 500,
  marginLeft: 'auto',
  marginRight: 'auto',
}

export const LandingPage = ({
  setStep
}) => {

  const [selectedOption, setSelectedOption] = useState(STEPS.FORM);

  return (
    <div style={landingPageStyle}>
      <MyTitle text={'Test your internet speed'}/>
      <FormControl style={{width: '80%'}}>
        <FormLabel>Insert your address</FormLabel>
        <RadioGroup defaultValue={STEPS.FORM}>
          <FormControlLabel
            control={<Radio/>}
            label={'Manually'}
            value={STEPS.FORM}
            onChange={e => setSelectedOption(e.target.value)}/>
          <FormControlLabel
            control={<Radio/>}
            label={'Automatic based on location'}
            value={STEPS.MAP}
            onChange={e => setSelectedOption(e.target.value)}/>
        </RadioGroup>
      </FormControl>
      <MyButton text={'Continue'} onClick={() => setStep(selectedOption)} style={{marginTop: 10}}/>
      <MyButton text={'See all measurements'} onClick={() => setStep(STEPS.ALL_RESULTS)} style={{marginTop: 50}}/>
    </div>
  );
}