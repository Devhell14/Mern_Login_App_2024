import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/store";

export const AuthorizeUser = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to the home page if the user is not authorized
        return <Navigate to={'/'} replace={true} />;
    }

    // Render the children if the user is authorized
    return children;
}

export const ProtectRoute = ({ children }) => {
    const username = useAuthStore.getState().auth.username;

    if (!username) {
        // Redirect to the home page if the username is not available
        return <Navigate to={'/'} replace={true} />;
    }

    // Render the children if the username is available
    return children;
}
