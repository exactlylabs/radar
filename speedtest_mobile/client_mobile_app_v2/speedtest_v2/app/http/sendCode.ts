import { api } from "@/src/api/api"

export const sendCode = async (email: string) => {
    const response = await api.post('/authenticate/new_code', {
        email: email
    })

    return response
}