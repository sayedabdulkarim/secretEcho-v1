// API Configuration
// const isDevelopment = process.env.NODE_ENV === "development";
const isDevelopment = false;

export const API_CONFIG = {
  // Use localhost in development, deployed URL in production
  baseUrl: isDevelopment
    ? "http://localhost:5001/"
    : "https://secretEcho-v1.onrender.com/",
  socketUrl: isDevelopment
    ? "http://localhost:5001"
    : "https://secretEcho-v1.onrender.com",
};
