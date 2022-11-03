import {ReactElement} from "react";
import {GeospaceOverview} from "../api/geospaces/types";
import MenuContentGeospace from "../components/common/MyGenericMenu/MenuContentGeospace/MenuContentGeospace";

export enum MenuContent {
  GEOSPACE = 'GEOSPACE',
}

export const getMenuContent = (content: MenuContent, value: any, params: any): ReactElement => {
  switch (content) {
    case MenuContent.GEOSPACE:
      return <MenuContentGeospace geospace={value as GeospaceOverview} speedType={params.speedType}/>
    default:
      return <h1>Default</h1>
  }
}