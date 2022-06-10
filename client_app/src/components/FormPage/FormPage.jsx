import React, {useState} from 'react';
import {Container, FormControl, TextField} from "@mui/material";
import {MyButton} from "../common/MyButton";
import {MyTitle} from "../common/MyTitle";

const FormPage = ({
  goToNextStep
}) => {

  const [formData, setFormData] = useState({name: null, number: null});

  const handleInputChange = e => {
    const value = e.target.value;
    const input = e.target.name;
    const values = {...formData};
    if(input === 'name') values.name = value;
    else values.number = value;
    setFormData(values);
  }

  return (
    <Container style={{textAlign: 'center'}}>
      <MyTitle text={'Address information'}/>
      <FormControl fullWidth style={{textAlign: 'center', margin: "auto"}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <TextField
            required
            label={'Street name'}
            type={'text'}
            placeholder={'Insert your street name'}
            name={'name'}
            onChange={handleInputChange}
            margin={'normal'}
            style={{width: '75%'}}
          />
          <TextField
            required
            label={'Street number'}
            type={'number'}
            placeholder={'Insert your street number'}
            name={'number'}
            onChange={handleInputChange}
            margin={'normal'}
          />
        </div>
        <MyButton
          style={{width: '50%'}}
          text={'Submit'}
          onClick={() => goToNextStep(formData)}
          disabled={!formData.name || !formData.number}
        />
      </FormControl>
    </Container>
  );
}

export default FormPage;