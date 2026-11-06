import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_LOCAL,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN"});
// Separate endpoint because /authenticate is outside /api
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL_LOCAL_API,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN"
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const url = new URL(
            originalRequest.url,
            originalRequest.baseURL || api.defaults.baseURL
        ).pathname;

        // Don't refresh for these endpoints
        if (
            url.endsWith("/csrf") ||
            url.endsWith("/authenticate") ||
            url.endsWith("/profile/refresh-token") ||
            url.endsWith("/logout")
        ) {
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                await api.post("/profile/refresh-token");
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;