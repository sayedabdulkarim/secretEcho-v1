import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import App from "../App";
import PublicRoute from "../component/PublicRoute";
import PrivateRoute from "../component/PrivateRoute";

//auth routes
import HomeScreen from "../pages/auth/HomePage";
//unauth routes
import LoginScreen from "../pages/unauth/LoginPage";
import RegisterScreen from "../pages/unauth/RegisterPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
      </Route>
      {/* private routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route index={true} path="/" element={<HomeScreen />} />
      </Route>
      <Route path="*" element={<h1>404 Component</h1>} />
    </Route>
  )
);
