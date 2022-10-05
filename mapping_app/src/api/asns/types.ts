import {PaginatedResponse} from "../index";

export type Asn = {
  id: string;
  asn: string;
  organization: string;
}

export type AsnsResponse = PaginatedResponse<Asn>;

export const isAsn = (object: any): object is Asn => {
  if(!object) return false;
  return !!object.organization; // This covers both cases of null && undefined
}