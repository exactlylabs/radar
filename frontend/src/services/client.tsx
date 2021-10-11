import { builtinModules } from "module";

const endpoint = API_ENDPOINT;

class ApiError extends Error {
  readonly reason: string;
  readonly code: string;
  readonly args?: { string: readonly string[] };

  constructor(reason: string, code: string, args: { string: string[] }) {
    super(reason);

    this.reason = reason;
    this.code = code;
    this.args = args;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

interface ApiResponse<T> {
  data: T;
  failed: boolean;
  failureCode: string;
  failureReason: string;
  failureArgs: { string: string[] };
}

export interface Beacon {
  id: string;
  name: string;
  address: string;
}

interface LoginArgs {
  username: string;
  password: string;
}

interface Login {
  token: string;
}

interface AddBeaconArgs {
  beaconSecret: string;
}

interface Empty {}

function searchParams(params: object) : string {
  return Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
}

export default class Client {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  async authenticate(username: string, password: string) {
    const resp = await this.post<LoginArgs, Login>('/login', { username, password });
    this.token = resp.token;
  }

  async fetchBeacons() : Promise<Beacon[]> {
    return await this.get<Beacon[]>('/beacons');
  }

  async addBeacon(beaconId: string, beaconSecret: string) {
    await this.post<AddBeaconArgs, Empty>(`/beacons/${beaconId}/add`, { beaconSecret });
    return;
  }

  private async get<T>(urlPart: string): Promise<T> {
    const url = new URL('/beacons', endpoint);

    const options : RequestInit = {
      method: 'GET'
    };

    if (this.token != null) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    const resp = await fetch(url.toString(), options);
    const body = await resp.json() as ApiResponse<T>;
    if(body.failed) {
      throw new ApiError(body.failureReason, body.failureCode, body.failureArgs);
    }

    return body.data;
  }

  private async post<A extends Object, R>(urlPart: string, args: A): Promise<R> {
    const url = new URL('/beacons', endpoint);
    const options : RequestInit = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(searchParams(args))
    };

    if (this.token != null) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    const resp = await fetch(url.toString(), options);
    const body = await resp.json() as ApiResponse<R>;
    if(body.failed) {
      throw new ApiError(body.failureReason, body.failureCode, body.failureArgs);
    }

    return body.data;
  }
}
