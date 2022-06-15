import React from 'react';
import {MyButton} from "../common/MyButton";

const Frame = ({
  config,
  children,
  step,
  setStep
}) => {

  return (
    <div style={{...config.frameStyle}}>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: 10}}>
      {
        step !== 'landing' &&
        <MyButton text={'< Back'} onClick={() => setStep('landing')} style={{marginTop: 10}}/>
      }
      </div>
      {children}
    </div>
  )
}

export default Frame;