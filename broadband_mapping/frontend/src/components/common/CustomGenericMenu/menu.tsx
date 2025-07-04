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
import {Optional} from "../../../utils/types";

export enum MenuContent {
  GEOSPACE = 'GEOSPACE',
  FULL_GEOSPACE = 'FULL_GEOSPACE',
  SPEED_TYPE = 'SPEED_TYPE',
  PROVIDERS = 'PROVIDERS',
  CALENDAR = 'CALENDAR',
  CUSTOM_DATE_RANGE = 'CUSTOM_DATE_RANGE',
  YEAR_OR_MONTH = 'YEAR_OR_MONTH',
}

export const getMenuContent = (content: Optional<MenuContent>, params?: any): ReactElement => {
  if(!content) return <></>;
  switch (content) {
    case MenuContent.SPEED_TYPE:
      return <MenuContentSpeedType {...params}/>
    case MenuContent.PROVIDERS:

    case MenuContent.CALENDAR:
      return <MenuContentCalendar {...params}/>
    case MenuContent.CUSTOM_DATE_RANGE:
      return <MenuContentCustomDateRange {...params}/>
    default:
      return <></>;
  }
}