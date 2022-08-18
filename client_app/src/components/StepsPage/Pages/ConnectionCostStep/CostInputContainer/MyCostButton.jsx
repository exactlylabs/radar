import MinusButton from '../../../../../assets/less-button.png';
import PlusButton from '../../../../../assets/plus-button.png';

const buttonStyle = {
  width: 32,
  height: 32,
  cursor: 'pointer',
}

const MyCostButton = ({
  type,
  onClick
}) => {
  return (
    <div style={buttonStyle} onClick={onClick}>
      <img src={type === 'minus' ? MinusButton : PlusButton} width={32} height={32} alt={`${type}-button`}/>
    </div>
  )
}

export default MyCostButton;