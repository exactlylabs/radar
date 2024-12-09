import { api } from "@/src/api/api"

interface SendCodeResponse {
    ok: boolean;
}

interface GetTokenResponse {
    token: string;
}

export const sendCode = async (email: string) => {
    return await api.post('/authenticate/new_code', {
        email: email
    })
}

export const getToken = async (code: string) => {
    return await api.post('/authenticate/get_token', {
        code: code
    })
}