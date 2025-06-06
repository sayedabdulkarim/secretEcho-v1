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
    }),
    registerUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    getPrivateData: builder.query({
      query: () => `${USERS_URL}/test`, // This sets up the URL for the GET request
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useGetPrivateDataQuery,
} = userApiSlice;
