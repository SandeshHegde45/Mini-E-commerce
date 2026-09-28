import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "@/features/auth/authSlice";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3000/api");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include", // send the httpOnly refreshToken cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Prevents parallel requests from all trying to refresh the token at once.
let refreshPromise = null;

const AUTH_FREE_URLS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
]);

async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && !AUTH_FREE_URLS.has(url)) {
    refreshPromise ??= rawBaseQuery(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions,
    ).finally(() => {
      refreshPromise = null;
    });

    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data.data));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Cart", "Me"],
  endpoints: () => ({}),
});
