import {toast,Bounce} from "react-toastify"
import {useTheme} from "../components/theme-provider"

//i want to use this hook to show notifications
export const useNotification = () => {
    const {theme} = useTheme();
    const notify = (message,position="top-center" ,type = "success") => {
        toast(message, {
            position: position,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true, 
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: theme === "dark" ? "dark" : "light", // Use the theme from the context
            transition: Bounce,
            type: type,
        });
    }   
    return {
        notify,
    }
}