import {ReactElement, useEffect} from "react";
import {goToUrl} from "../src/utils/navigation";

const ServerError = (): ReactElement => {
  useEffect(() => {goToUrl('/home')}, []);
  return (<div></div>);
}

export default ServerError;