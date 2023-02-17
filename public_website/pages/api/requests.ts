import {IMailBody} from "../../src/components/GetStartedPage/GetStartedForm/GetStartedForm";

const API_URL =
  process.env.NODE_ENV === 'production' ? 'https://radartoolkit.com/api' :
  process.env.NODE_ENV === 'staging' ? 'https://toolkit.staging.exactlylabs.com/api' :
  'http://localhost:3000/api';

export interface IContactSubmissionReply {
  msg: string;
  status: number;
}

export enum MailReply {
  OK = 'Notification sent correctly',
  BAD_REQUEST = 'Missing body name and/or email',
  ERROR = 'Unexpected error'
}

export const submitContactData = (mailBody: IMailBody): Promise<IContactSubmissionReply> => {
  console.log(process.env.NODE_ENV, API_URL);
  return fetch(`${API_URL}/contact`, {
    method: 'POST',
    body: JSON.stringify(mailBody)
  })
    .then(res => res.json() as Promise<IContactSubmissionReply>);
}