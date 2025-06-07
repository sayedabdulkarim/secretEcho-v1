import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import AiChatAgentIcon from "./AiChatAgentIcon";
import AiChatAgentModal from "./AiChatAgentModal";

const PrivateRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  return userInfo ? (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <AiChatAgentIcon />
      <AiChatAgentModal />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
