import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    const hasToken = (() => { try { return localStorage.getItem("accessToken"); } catch { return null; } })();
    
    useEffect(() => {
        const checkAuth = async () => {
            // Give some time for the auth state to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!isAuthenticated && !hasToken) {
                navigate("/login", { replace: true });
            }
            setIsChecking(false);
        };
        
        checkAuth();
    }, [isAuthenticated, hasToken, navigate]);

    // Show loading while checking authentication or while we have a token but not authenticated yet
    if (isChecking || (!isAuthenticated && hasToken)) {
        return <AuthLoading text="Verifying authentication..." />;
    }

    // Only render children if authenticated
    return isAuthenticated ? children : null;
}

export const Guest = ({ children}) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    
    const hasToken = (() => { try { return localStorage.getItem("accessToken"); } catch { return null; } })();
    
    useEffect(() => {
        const checkAuth = async () => {
            // Give some time for the auth state to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (isAuthenticated) {
                navigate("/chat", { replace: true });
            }
            setIsChecking(false);
        };
        
        checkAuth();
    }, [isAuthenticated, navigate]);
    
    // Show loading if we're checking auth state or if we have a token (might be authenticating)
    if (isChecking || (hasToken && !isAuthenticated)) {
        return <AuthLoading text="Checking authentication..." />;
    }

    return !isAuthenticated ? children : null;
}
