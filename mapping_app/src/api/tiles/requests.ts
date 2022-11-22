import {API_URL, handleError, throwError} from "../index";


export const getVectorTilesUrl = (namespace: string = 'counties', dateQueryString?: string): string => {
  return `${API_URL}/tiles/{z}/{x}/{y}${dateQueryString ? `&${dateQueryString}` : ''}`;
}