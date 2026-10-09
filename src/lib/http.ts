import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types";

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // sends the httpOnly access_token cookie automatically
});

http.interceptors.response.use(
    // Unwrap {statusCode, message, data} so every caller gets `data` directly.
    (response) => {
        const body = response.data as ApiResponse<unknown>;
        return { ...response, data: body.data };
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        const status = error.response?.status;
        const url = error.config?.url ?? "";
        // Never auto-redirect for these two: a failed login attempt should
        // show an inline error (not bounce the page), and a 401 from the
        // startup "am I logged in?" check is the normal logged-out case --
        // AuthContext already handles it quietly. Redirecting on either
        // would cause a reload loop (the redirect lands back on a page that
        // triggers the same check again).
        const isExemptFromRedirect =
            url.includes("/auth/login") || url.includes("/auth/me");

        if (status === 401 && !isExemptFromRedirect && typeof window !== "undefined") {
            window.location.href = "/login";
        }

        const message = error.response?.data?.message ?? "Something went wrong";
        return Promise.reject(new Error(message));
    },
);
