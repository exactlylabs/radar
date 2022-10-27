import {PaginationLinks} from "../index";

export type Asn = {
  id: string;
  asn: string;
  organization: string;
}

export type AsnsResponse = {
  _links: PaginationLinks;
  count: number;
  results: Array<Asn>;
}

export const isAsn = (object: any): object is Asn => {
  return !!object.organization; // This covers both cases of null && undefined
}