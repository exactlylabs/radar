// API Request Types
export interface AuthenticationRequest {
    device_id: string;
}

export interface SendCodeRequest extends AuthenticationRequest {
    email: string;
}

export interface GetTokenRequest extends AuthenticationRequest {
    code: string;
}

// API Response Types
export interface GetTokenResponse {
    token: string;
}
