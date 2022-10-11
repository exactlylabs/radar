import {ReactElement} from "react";
import MyMap from "./MyMap";
import {styles} from "./styles/ExplorePage.style";


const ExplorePage = (): ReactElement => {

  return (
    <div style={styles.ExplorePageContainer}>
      <MyMap />
    </div>
  )
}

export default ExplorePage;