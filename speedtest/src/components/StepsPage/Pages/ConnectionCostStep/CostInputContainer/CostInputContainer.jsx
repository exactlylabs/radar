import MyCostInput from "./MyCostInput";
import MyCostButton from "./MyCostButton";
import {isEventBackspace, isValidNumericalCharacter} from "../../../../../utils/validations";

const costInputContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 40,
  marginBottom: 40,
}

/**
 * Custom cost input element for connection cost.
 * @returns {JSX.Element}
 */
const CostInputContainer = ({
  cost,
  setCost
}) => {

  const subtractTen = () => {
    if(!cost || cost === '0.00') return;
    const newCost = parseFloat(cost) - 10;
    if(newCost < 0) setCost('');
    else setCost(newCost.toFixed(2));
  }

  const addTen = () => {
    if(!cost) {
      const ten = 10;
      setCost(ten.toFixed(2));
      return;
    }
    const newCost = parseFloat(cost) + 10;
    setCost(newCost.toFixed(2));
  }

  const handleChange = e => {
    if(isEventBackspace(e.nativeEvent) || isValidNumericalCharacter(e.nativeEvent.data)) {
      setCost(e.target.value);
    }
  }

  return (
    <div style={costInputContainerStyle}>
      <MyCostButton type={'minus'} onClick={subtractTen}/>
      <MyCostInput type={'number'} value={cost} handleChange={handleChange}/>
      <MyCostButton type={'plus'} onClick={addTen}/>
    </div>
  )
}

export default CostInputContainer;