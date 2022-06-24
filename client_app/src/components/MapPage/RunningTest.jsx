import React from "react";
import {CircularProgress} from "@mui/material";
import { ArrowCircleDown, ArrowCircleUp } from "@mui/icons-material";

const RunningTest = ({
  downloadValue,
  uploadValue,
  progress
}) => {

  return (
    <div style={{height: 155}}>
      <CircularProgress variant="determinate" size={150} value={progress}/>
      <div style={{position: 'relative', top: -120}}>
        {
          downloadValue !== null && uploadValue === null && 
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <ArrowCircleDown fontSize={'large'}/>
            <p style={{fontWeight: 'bold'}}>{`${downloadValue.toFixed(3)} mbps`}</p>
          </div>
        }
        {
          uploadValue !== null && 
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <ArrowCircleUp fontSize={'large'}/>
            <p style={{fontWeight: 'bold'}}>{`${uploadValue.toFixed(3)} mbps`}</p>
          </div>
        }
      </div>
    </div>
  );
}

export default RunningTest;