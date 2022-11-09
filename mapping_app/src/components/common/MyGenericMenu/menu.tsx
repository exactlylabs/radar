import {ReactElement} from "react";
import {GeospaceOverview} from "../../../api/geospaces/types";
import MenuContentGeospace from "./MenuContentGeospace/MenuContentGeospace";
import MenuContentFullGeospace
  from "./MenuContentFullGeospace/MenuContentFullGeospace";
import MenuContentSpeedType from "./MenuContentSpeedType/MenuContentSpeedType";
import MenuContentProviders from "./MenuContentProviders/MenuContentProviders";

export enum MenuContent {
  GEOSPACE = 'GEOSPACE',
  FULL_GEOSPACE = 'FULL_GEOSPACE',
  SPEED_TYPE = 'SPEED_TYPE',
  PROVIDERS = 'PROVIDERS',
}

export const getMenuContent = (content: MenuContent, params?: any): ReactElement => {
  switch (content) {
    case MenuContent.GEOSPACE:
      return <MenuContentGeospace {...params}/>
    case MenuContent.FULL_GEOSPACE:
      return <MenuContentFullGeospace {...params}/>
    case MenuContent.SPEED_TYPE:
      return <MenuContentSpeedType {...params}/>
    case MenuContent.PROVIDERS:
      return <MenuContentProviders {...params}/>
    default:
      return <h1>Default</h1>
  }
}