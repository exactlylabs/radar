import MyCostInput from "./MyCostInput";
import MyCostButton from "./MyCostButton";

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
    if(!cost) return;
    if((cost - 10) < 0) setCost(0);
    else setCost(parseInt(cost) - 10);
  }

  const addTen = () => {
    if(!cost) {
      setCost(10);
      return;
    }
    setCost(parseInt(cost) + 10);
  }

  const handleChange = e => {
    const newCost = parseInt(e.target.value);
    if(isNaN(newCost)) setCost(0);
    else setCost(newCost);
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