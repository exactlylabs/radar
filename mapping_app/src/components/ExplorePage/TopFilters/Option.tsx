import {ReactElement} from "react";
import {styles} from "./styles/Option.style";
import {CheckRounded} from "@mui/icons-material";

interface OptionProps {
  option: string;
  selected: boolean;
  onClick: (option: string) => void;
}

const Option = ({
  option,
  selected,
  onClick
}: OptionProps): ReactElement => {

  const handleClick = () => {
    onClick(option);
  }

  return (
    <div style={styles.Option()} onClick={handleClick}>
      <p className={'hover-opaque'} style={styles.Text(selected)}>{option}</p>
      { !selected && <div style={styles.Icon()}></div> }
      {  selected && <CheckRounded style={styles.Icon()}/> }
    </div>
  )
}

export default Option;