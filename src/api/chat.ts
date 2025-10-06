import { api } from "./restapi";

export const createMessage = async (message: string, context: Record<string, string>) => {
    const response = await api.post("/message", { message, context });
    return response.data;
};