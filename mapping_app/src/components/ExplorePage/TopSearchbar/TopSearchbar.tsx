import {ChangeEvent, ReactElement} from "react";
import {styles} from "./styles/TopSearchbar.style";
import SearchIcon from "../../../assets/search-icon.png";
import {ArrowForwardRounded} from "@mui/icons-material";

const TopSearchbar = (): ReactElement => {

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // TODO: API request with given text
  }

  return (
    <div style={styles.TopSearchbarContainer()}>
      <div style={styles.IconContainer()}>
        <img src={SearchIcon} style={styles.SearchIcon()} alt={'search-icon'}/>
      </div>
      <input placeholder={'State, county, city, address...'}
             className={'fw-light'}
             style={styles.Input()}
             onChange={handleInputChange}
      />
      <div className={'hover-opaque'} style={styles.ArrowContainer()}>
        <ArrowForwardRounded style={styles.Arrow()}/>
      </div>
    </div>
  )
}

export default TopSearchbar;