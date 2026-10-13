
import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios"
import { endpoints } from "@/api/endpoints/endpoints"



export const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009"

const AxiosInstance = axios.create({
    baseURL,
    withCredentials: true,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

const publicAuthEndpoints = [
    endpoints.auth.signIn,
    endpoints.auth.signUp,
    endpoints.auth.otp,
]

let refreshRequest: Promise<void> | null = null

AxiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined
        const requestUrl = originalRequest?.url ?? ""
        const isPublicAuthRequest = publicAuthEndpoints.some((endpoint) =>
            requestUrl.includes(endpoint)
        )

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isPublicAuthRequest
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        if (!refreshRequest) {
            refreshRequest = axios
                .post<{ status: boolean }>(
                    `${baseURL}${endpoints.auth.refreshToken}`,
                    null,
                    { withCredentials: true }
                )
                .then(({ data }) => {
                    if (data.status !== true) {
                        throw new Error("Session refresh failed")
                    }
                })
                .finally(() => {
                    refreshRequest = null
                })
        }

        try {
            await refreshRequest
            return AxiosInstance.request(originalRequest)
        } catch (refreshError) {
            if (
                axios.isAxiosError(refreshError) &&
                [401, 403].includes(refreshError.response?.status ?? 0) &&
                typeof window !== "undefined" &&
                window.location.pathname !== "/auth/signIn"
            ) {
                const signInUrl = new URL("/auth/signIn", window.location.origin)
                signInUrl.searchParams.set("message", "session_expired")
                window.location.assign(signInUrl.toString())
            }

            return Promise.reject(refreshError)
        }
    }
)

export default AxiosInstance