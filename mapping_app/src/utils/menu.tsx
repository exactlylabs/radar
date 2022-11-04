import {ReactElement} from "react";
import {GeospaceOverview} from "../api/geospaces/types";
import MenuContentGeospace from "../components/common/MyGenericMenu/MenuContentGeospace/MenuContentGeospace";
import MenuContentFullGeospace
  from "../components/common/MyGenericMenu/MenuContentFullGeospace/MenuContentFullGeospace";

export enum MenuContent {
  GEOSPACE = 'GEOSPACE',
  FULL_GEOSPACE = 'FULL_GEOSPACE',
}

export const getMenuContent = (content: MenuContent, value: any, params?: any): ReactElement => {
  switch (content) {
    case MenuContent.GEOSPACE:
      return <MenuContentGeospace geospace={value as GeospaceOverview} {...params}/>
    case MenuContent.FULL_GEOSPACE:
      return <MenuContentFullGeospace geospace={value as GeospaceOverview} {...params}/>
    default:
      return <h1>Default</h1>
  }
}