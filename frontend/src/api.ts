import axios from "axios";

const USER_URL = import.meta.env.VITE_USER_URL ?? "http://localhost:5000";
const SONG_URL = import.meta.env.VITE_SONG_URL ?? "http://localhost:8000";
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? "http://localhost:7000";

export const userApi = axios.create({ baseURL: `${USER_URL}/api/v1` });
export const songApi = axios.create({ baseURL: `${SONG_URL}/api/v1` });
export const adminApi = axios.create({ baseURL: `${ADMIN_URL}/api/v1` });

/** Pull a human-readable message out of an axios error. */
export function apiError(err: unknown, fallback = "Something went wrong"): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response?.data
      ?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data
      .message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Attach (or clear) the JWT on the user + admin axios instances.
 * The song service is public, so it does not need the token.
 */
export function setAuthToken(token: string | null) {
  if (token) {
    const header = `Bearer ${token}`;
    userApi.defaults.headers.common.Authorization = header;
    adminApi.defaults.headers.common.Authorization = header;
    // Some backend middleware also reads a custom `token` header.
    userApi.defaults.headers.common.token = token;
    adminApi.defaults.headers.common.token = token;
  } else {
    delete userApi.defaults.headers.common.Authorization;
    delete adminApi.defaults.headers.common.Authorization;
    delete userApi.defaults.headers.common.token;
    delete adminApi.defaults.headers.common.token;
  }
}
