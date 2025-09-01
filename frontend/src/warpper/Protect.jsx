import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? children : null;
}

export const Guest = ({ children}) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return !isAuthenticated ? children : null;
}
