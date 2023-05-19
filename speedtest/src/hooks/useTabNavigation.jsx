import {useHistory} from "react-router-dom";
import {getParamsFromObject} from "../utils/naviagtion";

const TabNumber = {
  speedTest: 0,
  history: 1,
  allResults: 2,
}

export const useTabNavigation = () => {
  const history = useHistory();

  return (step, params = null) => {
    let tabNumber = TabNumber[step];
    let paramString = '';
    if(params) paramString = `${getParamsFromObject(params)}`
    history.replace(`/?tab=${tabNumber}${paramString}`);
  };
}