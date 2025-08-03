import {useSelector} from "react-redux"
import {useNavigate} from "react-router-dom"


// i want wrapper to be a component that wraps around the children and checks if the user is logged in or not

export const Protect = ({children}) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const isVerified = useSelector((state) => state.auth.isVerified);
    const navigate = useNavigate();

    //if user is Authenticte but not verified i will do nothing
    if (isAuthenticated && !isVerified) {
        return children;
    }
    else if(!isAuthenticated) {
        navigate("/login");
        return null;
    }

    if(isAuthenticated && isVerified) {
        return children;
    }
    
}