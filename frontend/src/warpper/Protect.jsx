import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthLoading } from "@/components/ui/loading-page";

// Component to protect routes for authenticated users
// export const ProtectedRoute = ({ children }) => {
//     const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         if (!isAuthenticated) {
//             navigate("/login");
//         }
//     }, [isAuthenticated, navigate]);
    
//     return isAuthenticated ? children : null;
// };

// // Component to protect routes for unauthenticated users (guests)
// export const GuestRoute = ({ children }) => {
//     const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/");
//         }
//     }, [isAuthenticated, navigate]);
    
//     return !isAuthenticated ? children : null;
// };


export const Protect = ({ children}) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const navigate = useNavigate();

    // Check if we have a token in localStorage (indicates potential authentication)
    const hasToken = localStorage.getItem("accessToken");
    
    useEffect(() => {
        // Only redirect if there's no token and not authenticated
        if (!isAuthenticated && !hasToken) {
            navigate("/login");
        }
    }, [isAuthenticated, hasToken, navigate]);

    // Show loading or nothing while checking authentication
    if (!isAuthenticated && hasToken) {
        return <AuthLoading text="Verifying authentication..." />;
    }

    return isAuthenticated ? children : null;
}

export const Guest = ({ children}) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/chat");
        }
    }, [isAuthenticated, navigate]);

    return !isAuthenticated ? children : null;
}
