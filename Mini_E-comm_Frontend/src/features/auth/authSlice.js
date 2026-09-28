import { createSlice } from "@reduxjs/toolkit";

// The API returns the role only inside the JWT, so read it from the token payload.
function getRoleFromToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).role ?? "user";
  } catch {
    return "user";
  }
}

const initialState = {
  user: null, // { id, name, email, role }
  accessToken: null,
  status: "loading", // 'loading' | 'authenticated' | 'guest'
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.accessToken = accessToken ?? state.accessToken;
      state.user = user
        ? { ...user, id: user.id ?? user.userId, role: getRoleFromToken(state.accessToken) }
        : state.user;
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "guest";
    },
    bootstrapFailed(state) {
      state.status = "guest";
    },
  },
});

export const { setCredentials, clearCredentials, bootstrapFailed } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);
export const selectIsSeller = (state) => state.auth.user?.role === "seller";
export const selectAuthStatus = (state) => state.auth.status;
