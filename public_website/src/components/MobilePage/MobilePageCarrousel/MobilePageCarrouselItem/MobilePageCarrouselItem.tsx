import {ReactElement, useState} from "react";
import {styles} from "./styles/MobilePageCarrouselItem.style";

interface MobilePageCarrouselItemProps {
  selected: boolean;
  icon: ReactElement;
  title: string;
  subtitle: string;
  progress: number;
  index: number;
  setSelectedItem: (newItem: number) => void;
}

const MobilePageCarrouselItem = ({
  selected,
  icon,
  title,
  subtitle,
  progress,
  index,
  setSelectedItem
}: MobilePageCarrouselItemProps): ReactElement => {

  const [hovered, setHovered] = useState(false);

  const hover = () => setHovered(true);
  const unhover = () => setHovered(false);

  const selectItem = () => setSelectedItem(index);

  return (
    <div style={styles.MobilePageCarrouselItem(selected || hovered)}
         onMouseOver={hover}
         onMouseLeave={unhover}
         onClick={selectItem}
    >
      <div style={styles.IconContainer}>
        {icon}
      </div>
      <p className={'fw-bold'} style={styles.Title}>{title}</p>
      <p className={'fw-medium'} style={styles.Subtitle}>{subtitle}</p>
      { selected && <div style={styles.LoadingBar(progress)}></div> }
    </div>
  );
}

export default MobilePageCarrouselItem;