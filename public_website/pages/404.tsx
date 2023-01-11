import {ReactElement, useEffect} from "react";
import {goToHome} from "../src/utils/navigation";

const NotFound = (): ReactElement => {
  useEffect(() => {goToHome()}, []);
  return (<div></div>);
}

export default NotFound;