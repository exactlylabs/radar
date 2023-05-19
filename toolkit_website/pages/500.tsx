import React, {ReactElement, useEffect} from "react";
import {goToHome} from "../src/utils/navigation";

const ServerError = (): ReactElement => {
  useEffect(() => {goToHome()}, []);
  return (<div></div>);
}

export default ServerError;