import {useHistory} from "react-router-dom";

const TabNumber = {
  speedTest: 0,
  history: 1,
  allResults: 2,
}

export const useTabNavigation = () => {
  const history = useHistory();

  return (step) => {
    let tabNumber = TabNumber[step];
    history.replace(`/?tab=${tabNumber}`);
  };
}