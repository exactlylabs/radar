import {API_URL} from "../index";
import {Asn} from "../asns/types";


export const getVectorTilesUrl = (namespace: string = 'counties', dateQueryString?: string, provider?: Asn): string => {
  return `${API_URL}/tiles/{z}/{x}/{y}?${dateQueryString ? `${dateQueryString}` : ''}${provider ? `&asn_id=${provider.id}` : ''}`;
}