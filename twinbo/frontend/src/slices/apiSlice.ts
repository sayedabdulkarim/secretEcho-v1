import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../config/apiConfig";

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  credentials: "include", // Necessary for cookies to be included
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`); // Set the jwtt
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Conversation", "Message", "AiAgentChat"],
  endpoints: (builder) => ({}),
});
