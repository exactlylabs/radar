import React from 'react';
import { ArrowCircleDown, ArrowCircleUp } from '@mui/icons-material';

const TestAverages = ({
  downloadAvg,
  uploadAvg
}) => {

  return (
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '50%', margin: '10px auto'}}>
      <div style={{marginRight: 5}}>
        <ArrowCircleDown fontSize={'large'}/>
        <p style={{fontWeight: 'bold'}}>{`Average: ${downloadAvg.toFixed(3)} mbps`}</p>
      </div>
      <div>
        <ArrowCircleUp fontSize={'large'}/>
        <p style={{fontWeight: 'bold'}}>{`Average: ${uploadAvg.toFixed(3)} mbps`}</p>
      </div>
    </div>
  )
}

export default TestAverages;