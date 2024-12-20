import { api } from "@/src/api/api"
import { GetTokenResponse, SendCodeRequest, GetTokenRequest } from "@/src/types/api"
import { AxiosError } from "axios"
import { getAndroidId } from 'expo-application';

let cachedDeviceId: string | null = null;

const getDeviceId = async (): Promise<string> => {
    if (!cachedDeviceId) {
        cachedDeviceId = getAndroidId();
    }
    return cachedDeviceId;
}

/**
 * Sends a verification code to the specified email address
 * @param email - The email address to send the code to
 * @throws {AxiosError} If the API request fails
 */
export const sendCode = async (email: string): Promise<void> => {
    try {
        const request: SendCodeRequest = {
            email,
            device_id: await getDeviceId()
        }
        await api.post('/authenticate/new_code', request)
    } catch (error) {
        console.error(error)
        throw new Error('Failed to send verification code')
    }
}

/**
 * Gets an authentication token using a verification code
 * @param code - The verification code
 * @returns {Promise<GetTokenResponse>} The authentication token response
 * @throws {AxiosError} If the API request fails
 */
export const getToken = async (code: string): Promise<GetTokenResponse> => {
    try {
        const request: GetTokenRequest = {
            code,
            device_id: await getDeviceId()
        }
        const response = await api.post<GetTokenResponse>('/authenticate/get_token', request)
        return response.data
    } catch (error) {
        console.error(error)
        throw new Error('Failed to get authentication token')
    }
}
