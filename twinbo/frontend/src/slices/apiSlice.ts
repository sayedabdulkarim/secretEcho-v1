import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5001/",
  credentials: "include", // Necessary for cookies to be included
  prepareHeaders: (headers) => {
    // const csrfToken = getCsrfToken();
    // if (csrfToken) {
    //   // Set the CSRF token in the request headers
    //   headers.set("x-csrf-token", csrfToken);
    // }

    const token = localStorage.getItem("jwtToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`); // Set the jwtt
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
