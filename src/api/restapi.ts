import axios from "axios";


// How to get base url ??
let baseUrl = "http://localhost:8080";

export const api = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// TODO interceptors and error handling