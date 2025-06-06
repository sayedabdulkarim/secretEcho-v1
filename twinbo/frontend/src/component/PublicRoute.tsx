import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types/auth";

const PublicRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  // Redirect authenticated users to the home page
  return userInfo ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
