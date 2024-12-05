import { api } from "@/src/api/api"

export const sendCode = async (email: string) => {
    return await api.post('/authenticate/new_code', {
        email: email
    })
}