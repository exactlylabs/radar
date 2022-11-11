import {ReactElement} from "react";
import {GeospaceOverview} from "../../../api/geospaces/types";
import MenuContentGeospace from "./MenuContentGeospace/MenuContentGeospace";
import MenuContentFullGeospace
  from "./MenuContentFullGeospace/MenuContentFullGeospace";
import MenuContentSpeedType from "./MenuContentSpeedType/MenuContentSpeedType";
import MenuContentProviders from "./MenuContentProviders/MenuContentProviders";
import MenuContentCalendar from "./MenuContentCalendar/MenuContentCalendar";
import MenuContentCustomDateRange from "./MenuContentCustomRange/MenuContentCustomDateRange";
import MenuContentYearOrMonth from "./MenuContentYearOrMonth/MenuContentYearOrMonth";

export enum MenuContent {
  GEOSPACE = 'GEOSPACE',
  FULL_GEOSPACE = 'FULL_GEOSPACE',
  SPEED_TYPE = 'SPEED_TYPE',
  PROVIDERS = 'PROVIDERS',
  CALENDAR = 'CALENDAR',
  CUSTOM_DATE_RANGE = 'CUSTOM_DATE_RANGE',
  YEAR_OR_MONTH = 'YEAR_OR_MONTH',
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
    case MenuContent.CALENDAR:
      return <MenuContentCalendar {...params}/>
    case MenuContent.CUSTOM_DATE_RANGE:
      return <MenuContentCustomDateRange {...params}/>
    default:
      return <h1>Default</h1>
  }
}