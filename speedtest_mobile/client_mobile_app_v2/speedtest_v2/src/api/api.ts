import axios from "axios";

export const api = axios.create({
    baseURL: 'https://pods.staging.radartoolkit.com/mobile_api/v1/',
});

export const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

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