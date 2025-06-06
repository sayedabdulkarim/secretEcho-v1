import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types/auth";

const PrivateRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  return userInfo ? (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
