import { apiSlice } from "../apiSlice";

const USERS_URL = "api/auth";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    registerUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    verifyToken: builder.query({
      query: () => ({
        url: `${USERS_URL}/verify`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getPrivateData: builder.query({
      query: () => `${USERS_URL}/profile`,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useVerifyTokenQuery,
  useGetPrivateDataQuery,
} = userApiSlice;
