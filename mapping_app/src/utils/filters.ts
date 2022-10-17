export const filterTypes = {
  SPEED: 'speed',
  CALENDAR: 'calendar',
  PROVIDERS: 'providers',
}

export const speedFilters = ['Download', 'Upload'];
export const calendarFilters = ['All time', 'This week', 'This month', 'This year'];

export type TabsObject = {
  STATES: string;
  COUNTIES: string;
  TRIBAL_TRACTS: string;
}

export const tabs: TabsObject = {
  STATES: 'STATES',
  COUNTIES: 'COUNTIES',
  TRIBAL_TRACTS: 'TRIBAL_TRACTS',
}

export const getCorrectNamespace = (namespace: string): string => {
  return tabs[namespace.toUpperCase() as keyof TabsObject];
}

export const getZoomForNamespace = (namespace: string): number => {
  if(namespace.toUpperCase() === 'STATES') return 5;
  return 7;
}