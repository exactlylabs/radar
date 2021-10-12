export interface User {
  token: string;
}

export enum UserActionTypes {
  LOGGED_IN = 'user/LOGIN',
  LOGGED_OUT = 'user/LOGOUT',
}

export interface UserState {
  readonly token: string;
}
